/**
 * Supabase Keep-Alive Script
 * ป้องกัน Supabase Free Tier หยุดทำงาน (Auto-Pause) เมื่อไม่มีการใช้งานเกิน 7 วัน
 * รันสคริปต์นี้เป็นประจำผ่าน GitHub Actions หรือ Cron Job
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to load env vars from .env.local or .env if present
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

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const apiKey = serviceRoleKey || supabaseAnonKey;

async function runKeepAlive() {
  const startTime = Date.now();
  console.log('----------------------------------------------------');
  console.log('⚡ [Supabase Keep-Alive] Initializing health check...');
  console.log(`⏰ Time: ${new Date().toISOString()}`);

  if (!supabaseUrl || !apiKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in environment variables.');
    console.log('ℹ️ Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    process.exit(1);
  }

  console.log(`🌐 Supabase Target URL: ${supabaseUrl}`);

  try {
    const supabase = createClient(supabaseUrl, apiKey, {
      auth: { persistSession: false }
    });

    // 1. Query a lightweight table to generate active PostgreSQL database activity
    console.log('📡 Sending database ping query to PostgreSQL...');
    
    // We try to query heroes, teams, or themes (limit 1)
    let pingResult = await supabase.from('heroes').select('id, name').limit(1);
    
    if (pingResult.error) {
      // Fallback query to teams
      pingResult = await supabase.from('teams').select('id, name').limit(1);
    }

    if (pingResult.error) {
      // Fallback query to themes
      pingResult = await supabase.from('themes').select('id, name').limit(1);
    }

    const duration = Date.now() - startTime;

    if (pingResult.error) {
      console.warn(`⚠️ Table query failed: ${pingResult.error.message}`);
      console.log('🔄 Attempting fallback REST health check via fetch...');
      
      const restRes = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`
        }
      });

      if (!restRes.ok && restRes.status !== 200) {
        throw new Error(`REST endpoint responded with status: ${restRes.status} ${restRes.statusText}`);
      }

      console.log(`✅ Supabase REST API Ping Succeeded! (${duration}ms)`);
    } else {
      console.log(`✅ Supabase Database Query Succeeded! (${duration}ms)`);
      console.log(`📊 Sample record found:`, pingResult.data && pingResult.data.length > 0 ? pingResult.data[0] : 'Table empty, but DB active');
    }

    console.log(`🎉 Keep-Alive Success! Inactivity timer refreshed. Project will remain ACTIVE.`);
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`❌ Keep-Alive Ping Failed after ${duration}ms:`, err.message || err);
    console.log('----------------------------------------------------');
    process.exit(1);
  }
}

runKeepAlive();
