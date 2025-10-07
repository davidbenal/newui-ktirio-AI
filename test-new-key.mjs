import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.VITE_GOOGLE_GEMINI_API_KEY;
console.log('🔑 Chave carregada:', apiKey ? 'SIM' : 'NÃO');

const genAI = new GoogleGenerativeAI(apiKey);

const models = [
  'gemini-1.5-flash',
  'gemini-1.5-pro', 
  'gemini-2.0-flash-exp'
];

for (const modelName of models) {
  try {
    console.log(`\n🧪 Testando: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Diga olá');
    const text = result.response.text();
    console.log(`✅ ${modelName} FUNCIONA!`);
    console.log(`   Resposta: "${text}"`);
    console.log('\n🎉 API Gemini funcionando perfeitamente!');
    process.exit(0);
  } catch (err) {
    console.log(`❌ ${modelName} - Erro:`, err.message.substring(0, 100));
  }
}

console.log('\n⚠️  Nenhum modelo funcionou. Verifique a API.');
