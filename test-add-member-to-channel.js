// Test script for adding a member to a private channel
// This script assumes you have a local server running on port 3000

const channelId = process.argv[2];
const userId = process.argv[3];

if (!channelId || !userId) {
  console.log('Usage: node test-add-member-to-channel.js <channelId> <userId>');
  process.exit(1);
}

async function testAddMember() {
  try {
    console.log(`Adding user ${userId} to channel ${channelId}`);
    
    const response = await fetch(`http://localhost:3000/api/channels/${channelId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    
    if (response.ok) {
      console.log('Successfully added member to channel');
    } else {
      console.log('Failed to add member to channel');
    }
  } catch (error) {
    console.error('Error testing add member endpoint:', error);
 }
}

testAddMember();