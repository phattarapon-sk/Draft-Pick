/**
 * Supabase Keep-Alive Script (Zero-Dependency & Fail-Safe)
 * ป้องกัน Supabase Free Tier หยุดทำงาน (Auto-Pause) เมื่อไม่มีการใช้งานเกิน 7 วัน
 * ทำงานได้ทั้งในเครื่อง และบน GitHub Actions Cloud โดยไม่ต้องติดตั้งแพ็กเกจเพิ่ม
 */

const fs = require('fs');
const path = require('path');

// พยายามอ่านจาก .env.local หรือ .env ในเครื่องก่อน
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
      break;
    }
  }
}

loadEnv();

// ค่า Default จากโปรเจกต์ (Public Anon Key ปลอดภัยในการใช้ใน Client)
const DEFAULT_SUPABASE_URL = 'https://qckbfvrdkjhfvsyopmdu.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFja2JmdnJka2poZnZzeW9wbWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NzIxMjIsImV4cCI6MjEwNDI0ODEyMn0.u6dnHbLbGPzzhRGbdV5QrxCyT9Qud1TzuhBJCuf1HBc';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
               process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
               process.env.SUPABASE_ANON_KEY || 
               DEFAULT_ANON_KEY;

async function pingTable(tableName) {
  const endpoint = `${supabaseUrl}/rest/v1/${tableName}?select=id&limit=1`;
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Range-Unit': 'items',
      'Range': '0-0'
    }
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Table ${tableName} returned ${res.status}: ${errorText || res.statusText}`);
  }

  const data = await res.json().catch(() => []);
  return data;
}

async function runKeepAlive() {
  const startTime = Date.now();
  console.log('----------------------------------------------------');
  console.log('⚡ [Supabase Keep-Alive] Initializing health ping...');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🌐 Target: ${supabaseUrl}`);

  if (!supabaseUrl || !apiKey) {
    console.error('❌ Supabase URL or API Key is missing.');
    process.exit(1);
  }

  const tables = ['heroes', 'teams', 'themes', 'templates'];
  let success = false;
  let lastError = null;

  for (const table of tables) {
    try {
      console.log(`📡 Querying table '${table}' via PostgreSQL REST API...`);
      const data = await pingTable(table);
      const duration = Date.now() - startTime;
      console.log(`✅ Success! Table '${table}' responded in ${duration}ms`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`📊 Sample record found:`, data[0]);
      }
      success = true;
      break;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Query to '${table}' failed: ${err.message}`);
    }
  }

  if (!success) {
    // Fallback: ping root REST endpoint
    try {
      console.log('🔄 Trying root REST API endpoint ping...');
      const rootRes = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
        }
      });
      const duration = Date.now() - startTime;
      if (rootRes.ok || rootRes.status === 200) {
        console.log(`✅ Root REST endpoint responded in ${duration}ms (Status: ${rootRes.status})`);
        success = true;
      } else {
        throw new Error(`Root endpoint failed with status ${rootRes.status}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  const totalDuration = Date.now() - startTime;
  if (success) {
    console.log(`🎉 Keep-Alive Successful! (${totalDuration}ms)`);
    console.log('🚀 Inactivity timer refreshed. Supabase will remain ACTIVE.');
    console.log('----------------------------------------------------');
    process.exit(0);
  } else {
    console.error(`❌ Keep-Alive Failed after ${totalDuration}ms:`, lastError?.message || lastError);
    console.log('----------------------------------------------------');
    process.exit(1);
  }
}

runKeepAlive();
