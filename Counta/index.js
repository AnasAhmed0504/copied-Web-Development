require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, EndBehaviorType } = require('@discordjs/voice');
const prism = require('prism-media');
const fs = require('fs');
const { spawn } = require('child_process');
const wav = require('wav');
const speech = require('@google-cloud/speech');

const gClient = new speech.SpeechClient(); // uses GOOGLE_APPLICATION_CREDENTIALS

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const activeListeners = new Map(); // userId -> true
let count = 0;

// ------------------- GOOGLE TRANSCRIBE -------------------
async function transcribeGoogle(filePath) {
    const audio = fs.readFileSync(filePath);

    const request = {
        audio: { content: audio.toString('base64') },
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
        },
    };

    const [response] = await gClient.recognize(request);
    const transcription = response.results
        .map(r => r.alternatives[0].transcript)
        .join('\n');
    return transcription;
}

// ------------------- WAV SAVE -------------------
async function saveWaveFile(filename, pcmData, channels = 2, rate = 48000, sampleWidth = 2) {
    return new Promise((resolve, reject) => {
        const writer = new wav.FileWriter(filename, {
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8
        });

        writer.on('finish', resolve);
        writer.on('error', reject);

        writer.write(pcmData);
        writer.end();
    });
}

// ------------------- PCM → WAV -------------------
function pcmToWav(pcmPath, wavPath) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-f', 's16le',
            '-ar', '48000',
            '-ac', '2',
            '-i', pcmPath,
            wavPath
        ]);

        ffmpeg.on('close', resolve);
        ffmpeg.on('error', reject);
    });
}

// ------------------- KEYWORD DETECTION -------------------
function detectKeywords(text) {
    const t = text.toLowerCase();

    const blacklist = ['nigger', 'nigga', 'niggas', 'niggers', 'negroid', 'negros', 'zinji', 'zingi', 'zenji', 'zengi', 'negro'];
    if (blacklist.some(word => t.includes(word))) {
        count++;
        console.log("The N-word has been said " + count + " times");
    }

    if (t.includes('join me')) {
        console.log('Command detected');
    }
}

// ------------------- CLEANUP -------------------
function cleanup(...files) {
    for (const f of files) fs.unlink(f, () => {});
}

// ------------------- LISTEN TO USER -------------------
function listenToUser(connection, userId) {
    if (activeListeners.has(userId)) return;
    activeListeners.set(userId, true);

    const receiver = connection.receiver;
    const opusStream = receiver.subscribe(userId, {
        end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 }
    });

    const pcmStream = new prism.opus.Decoder({
        frameSize: 960,
        channels: 2,
        rate: 48000
    });

    const pcmPath = `audio_${userId}.pcm`;
    const wavPath = `audio_${userId}.wav`;
    const output = fs.createWriteStream(pcmPath);

    opusStream.pipe(pcmStream).pipe(output);

    output.on('finish', async () => {
        try {
            await pcmToWav(pcmPath, wavPath);
            const text = await transcribeGoogle(wavPath);
            console.log(`[${userId}] Transcript:`, text);
            detectKeywords(text);
        } catch (err) {
            console.error('Error transcribing:', err);
        } finally {
            cleanup(pcmPath, wavPath);
            activeListeners.delete(userId);
        }
    });
}

// ------------------- VOICE STATE UPDATE -------------------
client.on('voiceStateUpdate', (oldState, newState) => {
    if (!oldState.channelId && newState.channelId) {
        const connection = joinVoiceChannel({
            channelId: newState.channelId,
            guildId: newState.guild.id,
            adapterCreator: newState.guild.voiceAdapterCreator,
        });

        listenToUser(connection, newState.member.id);
    }
});

// ------------------- LOGIN -------------------
client.login(process.env.DISCORD_TOKEN);
