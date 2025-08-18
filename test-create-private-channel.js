// Test script for creating a private channel
// This script assumes you have a local server running on port 3000

const channelName = process.argv[2] || 'test-private-channel';
const channelDescription = process.argv[3] || 'A test private channel';

async function testCreatePrivateChannel() {
  try {
    console.log(`Creating private channel: ${channelName}`);
    
    const response = await fetch('http://localhost:3000/api/channels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: channelName,
        description: channelDescription,
        type: 'PRIVATE',
        isPrivate: true
      }),
    });
    
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    
    if (response.ok) {
      console.log(`Successfully created private channel with ID: ${data.id}`);
      return data.id;
    } else {
      console.log('Failed to create private channel');
      return null;
    }
  } catch (error) {
    console.error('Error creating private channel:', error);
    return null;
  }
}

testCreatePrivateChannel().then(channelId => {
  if (channelId) {
    console.log(`\nTo test adding members to this channel, run:`);
    console.log(`node test-channel-members.js ${channelId} <userId>`);
  }
});