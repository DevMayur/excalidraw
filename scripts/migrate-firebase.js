#!/usr/bin/env node

/**
 * Firebase Migration Script
 * 
 * This script helps you migrate from the current Excalidraw Firebase projects
 * to your own Firebase project.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔥 Firebase Migration Script');
  console.log('============================\n');
  
  console.log('Current Firebase Projects:');
  console.log('- Development: excalidraw-oss-dev');
  console.log('- Production: excalidraw-room-persistence\n');
  
  console.log('This script will help you set up your own Firebase project.\n');
  
  // Get new project details
  const devProjectId = await question('Enter your development Firebase project ID: ');
  const prodProjectId = await question('Enter your production Firebase project ID: ');
  
  console.log('\n📋 Next steps:');
  console.log('1. Create Firebase projects in Firebase Console');
  console.log('2. Enable Firestore Database and Storage');
  console.log('3. Get your Firebase configuration');
  console.log('4. Update environment variables\n');
  
  // Generate environment file templates
  const devEnvTemplate = `# Firebase Configuration for Development
VITE_APP_FIREBASE_CONFIG='{"apiKey":"YOUR_API_KEY","authDomain":"${devProjectId}.firebaseapp.com","projectId":"${devProjectId}","storageBucket":"${devProjectId}.appspot.com","messagingSenderId":"YOUR_SENDER_ID","appId":"YOUR_APP_ID"}'

# Other development environment variables
VITE_APP_PORT=3000
VITE_APP_WS_SERVER_URL=wss://api.excalidraw.com/socket.io/
VITE_APP_PORTAL_URL=https://portal.excalidraw.com
VITE_APP_AI_BACKEND=https://ai.excalidraw.com
VITE_APP_DISABLE_SENTRY=true
VITE_APP_COLLAPSE_OVERLAY=true
VITE_APP_ENABLE_ESLINT=true
VITE_APP_ENABLE_PWA=false
VITE_APP_GIT_SHA=development`;

  const prodEnvTemplate = `# Firebase Configuration for Production
VITE_APP_FIREBASE_CONFIG='{"apiKey":"YOUR_API_KEY","authDomain":"${prodProjectId}.firebaseapp.com","projectId":"${prodProjectId}","storageBucket":"${prodProjectId}.appspot.com","messagingSenderId":"YOUR_SENDER_ID","appId":"YOUR_APP_ID"}'

# Other production environment variables
VITE_APP_PORT=3000
VITE_APP_WS_SERVER_URL=wss://api.excalidraw.com/socket.io/
VITE_APP_PORTAL_URL=https://portal.excalidraw.com
VITE_APP_AI_BACKEND=https://ai.excalidraw.com
VITE_APP_DISABLE_SENTRY=false
VITE_APP_COLLAPSE_OVERLAY=true
VITE_APP_ENABLE_ESLINT=false
VITE_APP_ENABLE_PWA=true
VITE_APP_GIT_SHA=production`;

  // Write environment file templates
  fs.writeFileSync('.env.development.template', devEnvTemplate);
  fs.writeFileSync('.env.production.template', prodEnvTemplate);
  
  // Update .firebaserc
  const firebasercPath = path.join('firebase-project', '.firebaserc');
  const firebasercContent = {
    projects: {
      default: prodProjectId,
      development: devProjectId,
      production: prodProjectId
    }
  };
  
  fs.writeFileSync(firebasercPath, JSON.stringify(firebasercContent, null, 2));
  
  console.log('✅ Generated files:');
  console.log('- .env.development.template');
  console.log('- .env.production.template');
  console.log('- Updated firebase-project/.firebaserc\n');
  
  console.log('📝 Manual steps required:');
  console.log('1. Copy .env.development.template to .env.development');
  console.log('2. Copy .env.production.template to .env.production');
  console.log('3. Replace YOUR_API_KEY, YOUR_SENDER_ID, YOUR_APP_ID with actual values');
  console.log('4. Deploy Firebase rules: cd firebase-project && firebase deploy\n');
  
  console.log('🔗 Useful links:');
  console.log('- Firebase Console: https://console.firebase.google.com/');
  console.log('- Firebase Documentation: https://firebase.google.com/docs');
  console.log('- Migration Guide: ./FIREBASE_MIGRATION_GUIDE.md\n');
  
  rl.close();
}

main().catch(console.error);
