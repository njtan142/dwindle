// Test script for channel members functionality
// This script assumes you have a local server running on port 3000

const channelId = process.argv[2];
const userId = process.argv[3];

if (!channelId || !userId) {
  console.log('Usage: node test-channel-members.js <channelId> <userId>');
  process.exit(1);
}

async function testChannelMembers() {
  try {
    console.log(`Testing channel members functionality for channel ${channelId} and user ${userId}`);
    
    // Test 1: Get current members of the channel
    console.log('\n1. Getting current members of the channel...');
    const getMembersResponse = await fetch(`http://localhost:3000/api/channels/${channelId}/members`);
    const membersData = await getMembersResponse.json();
    
    console.log(`Status: ${getMembersResponse.status}`);
    console.log(`Current members:`, membersData);
    
    // Test 2: Add user to the channel
    console.log('\n2. Adding user to the channel...');
    const addMemberResponse = await fetch(`http://localhost:3000/api/channels/${channelId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    const addMemberData = await addMemberResponse.json();
    
    console.log(`Status: ${addMemberResponse.status}`);
    console.log(`Response:`, addMemberData);
    
    if (addMemberResponse.ok) {
      console.log('Successfully added member to channel');
    } else {
      console.log('Failed to add member to channel');
      return;
    }
    
    // Test 3: Get members again to verify the user was added
    console.log('\n3. Getting members again to verify the user was added...');
    const getMembersResponse2 = await fetch(`http://localhost:3000/api/channels/${channelId}/members`);
    const membersData2 = await getMembersResponse2.json();
    
    console.log(`Status: ${getMembersResponse2.status}`);
    console.log(`Members after adding:`, membersData2);
    
    // Test 4: Remove user from the channel
    console.log('\n4. Removing user from the channel...');
    const removeMemberResponse = await fetch(`http://localhost:3000/api/channels/${channelId}/members/${userId}`, {
      method: 'DELETE',
    });
    
    const removeMemberData = await removeMemberResponse.json();
    
    console.log(`Status: ${removeMemberResponse.status}`);
    console.log(`Response:`, removeMemberData);
    
    if (removeMemberResponse.ok) {
      console.log('Successfully removed member from channel');
    } else {
      console.log('Failed to remove member from channel');
      return;
    }
    
    // Test 5: Get members again to verify the user was removed
    console.log('\n5. Getting members again to verify the user was removed...');
    const getMembersResponse3 = await fetch(`http://localhost:3000/api/channels/${channelId}/members`);
    const membersData3 = await getMembersResponse3.json();
    
    console.log(`Status: ${getMembersResponse3.status}`);
    console.log(`Members after removing:`, membersData3);
    
    console.log('\n=== TEST RESULTS ===');
    console.log('✓ All channel members tests completed');
    
  } catch (error) {
    console.error('Error testing channel members functionality:', error);
 }
}

testChannelMembers();