import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.startsWith('sk-placeholder')) {
        console.error('❌ Error: Invalid or missing OPENAI_API_KEY in .env');
        console.error('Please update your .env file with a valid OpenAI API key.');
        return;
    }

    console.log('🔑 Testing OpenAI API Key...');
    console.log(`   Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);

    const openai = new OpenAI({ apiKey });

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: 'Hello! Are you working? Reply with "Yes, I am working!"' }],
            model: 'gpt-4o-mini',
        });

        console.log('\n✅ Success! Response from OpenAI:');
        console.log('---------------------------------------------------');
        console.log(completion.choices[0].message.content);
        console.log('---------------------------------------------------');
    } catch (error: any) {
        console.error('\n❌ API Connection Failed:', error.message);
        if (error.status === 401) {
            console.error('   -> Check if your API Key is correct.');
        }
        if (error.status === 429) {
            console.error('   -> Check your quota/credits.');
        }
    }
}

main();
