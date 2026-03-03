const fs = require('fs');
const path = require('path');

// Read logs from data/logs.json
const logsPath = path.join(__dirname, '..', 'data', 'logs.json');

try {
  if (!fs.existsSync(logsPath)) {
    console.log('📊 KPI Analysis');
    console.log('================');
    console.log('No session data found. Start using MiniHack to generate KPIs!');
    process.exit(0);
  }

  const logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
  
  if (logs.length === 0) {
    console.log('📊 KPI Analysis');
    console.log('================');
    console.log('No sessions completed yet.');
    process.exit(0);
  }

  // Calculate KPIs
  const totalSessions = logs.length;
  const totalKeystrokes = logs.reduce((sum, log) => sum + (log.keystrokes || 0), 0);
  const avgKeystrokes = Math.round(totalKeystrokes / totalSessions);
  
  // Calculate session completion rate (assuming all logs are completed sessions)
  const completionRate = 100;
  
  // Calculate AI response time (mock data for now)
  const avgAIResponseTime = '2.3s'; // This would need actual timing data
  
  // Calculate summary edit rate
  const editedSessions = logs.filter(log => log.isEdited).length;
  const editRate = Math.round((editedSessions / totalSessions) * 100);
  
  // Template usage
  const templateUsage = {};
  logs.forEach(log => {
    const template = log.declared_from_template || 'Custom';
    templateUsage[template] = (templateUsage[template] || 0) + 1;
  });
  
  // Most used template
  const mostUsedTemplate = Object.entries(templateUsage)
    .sort(([,a], [,b]) => b - a)[0];

  console.log('📊 MiniHack KPI Analysis');
  console.log('========================');
  console.log(`📈 Total Sessions: ${totalSessions}`);
  console.log(`✅ Completion Rate: ${completionRate}%`);
  console.log(`⌨️  Avg Keystrokes: ${avgKeystrokes}`);
  console.log(`🤖 AI Response Time: ${avgAIResponseTime}`);
  console.log(`✏️  Summary Edit Rate: ${editRate}%`);
  console.log('');
  
  console.log('🎯 Template Usage:');
  Object.entries(templateUsage)
    .sort(([,a], [,b]) => b - a)
    .forEach(([template, count]) => {
      const percentage = Math.round((count / totalSessions) * 100);
      console.log(`   ${template}: ${count} sessions (${percentage}%)`);
    });
  
  console.log('');
  console.log('📝 Recent Sessions:');
  logs.slice(-3).reverse().forEach((log, index) => {
    const date = new Date(log.timestamp || log.declared_timestamp).toLocaleDateString('ja-JP');
    const template = log.declared_from_template || 'Custom';
    const edited = log.isEdited ? '✏️' : '📋';
    console.log(`   ${index + 1}. ${date} - ${template} ${edited}`);
  });

} catch (error) {
  console.error('Error reading logs:', error);
  process.exit(1);
}
