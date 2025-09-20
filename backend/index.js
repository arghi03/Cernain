// backend/index.js - VERSI LENGKAP

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// BAGIAN YANG HILANG ADA DI SINI:
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rute untuk tes
app.get('/', (req, res) => {
    res.send('Backend Cernain aktif!');
});
// ===================================

// KODE HUGGING FACE YANG KEMARIN
app.post('/summarize', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Teks tidak boleh kosong.' });
    }

    const HF_TOKEN = process.env.HF_TOKEN;
    const API_URL = "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6";

    try {
        console.log("Mencoba menghubungi Hugging Face API...");

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "inputs": text,
                "parameters": { "min_length": 30, "max_length": 150 }
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
            const summary = data[0].summary_text;
            console.log("Berhasil mendapatkan rangkuman.");
            res.json({ summary: summary });
        } else {
            throw new Error("Respons API tidak valid.");
        }

    } catch (error) {
        console.error("Error saat menghubungi Hugging Face API:", error);
        if (error.message.includes("503")) {
            res.status(503).json({ error: 'Model AI sedang dimuat, coba lagi dalam 20 detik.' });
        } else {
            res.status(500).json({ error: 'Terjadi masalah pada server saat merangkum teks.' });
        }
    }
});



export default app;