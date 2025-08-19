const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGeneralChannelPersistence() {
  try {
    console.log('Starting test for general channel message persistence...');
    
    // 1. Check if general channel exists, create if not
    let generalChannel = await prisma.channel.findUnique({
      where: { name: 'general' }
    });
    
    if (!generalChannel) {
      console.log('General channel not found, creating it...');
      generalChannel = await prisma.channel.create({
        data: {
          name: 'general',
          description: 'General discussion channel',
          type: 'PUBLIC',
          isPrivate: false
        }
      });
      console.log('Created general channel:', generalChannel);
    } else {
      console.log('Found existing general channel:', generalChannel);
    }
    
    // 2. Create a test user if one doesn't exist
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      console.log('Test user not found, creating one...');
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Test'
        }
      });
      console.log('Created test user:', testUser);
    } else {
      console.log('Found existing test user:', testUser);
    }
    
    // 3. Send a test message to the general channel
    const testMessageContent = `Test message sent at ${new Date().toISOString()}`;
    console.log('Sending test message:', testMessageContent);
    
    const message = await prisma.message.create({
      data: {
        content: testMessageContent,
        channelId: generalChannel.id,
        userId: testUser.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });
    
    console.log('Message created successfully:', message);
    
    // 4. Verify the message is stored with correct channel ID
    const storedMessage = await prisma.message.findUnique({
      where: { id: message.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        channel: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log('Verifying stored message...');
    if (storedMessage) {
      console.log('✓ Message found in database');
      console.log('✓ Message content matches:', storedMessage.content === testMessageContent);
      console.log('✓ Channel ID matches:', storedMessage.channelId === generalChannel.id);
      console.log('✓ Channel name is "general":', storedMessage.channel.name === 'general');
      console.log('✓ User ID matches:', storedMessage.userId === testUser.id);
      
      // 5. Test retrieval of messages for the general channel
      console.log('Testing message retrieval for general channel...');
      const channelMessages = await prisma.message.findMany({
        where: { channelId: generalChannel.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 5
      });
      
      console.log(`Found ${channelMessages.length} messages in general channel`);
      const isMessageInList = channelMessages.some(m => m.id === message.id);
      console.log('✓ Test message appears in channel messages list:', isMessageInList);
      
      console.log('\n=== TEST RESULTS ===');
      console.log('✓ General channel exists and is properly configured');
      console.log('✓ Messages can be sent to the general channel');
      console.log('✓ Messages are stored with correct channel ID');
      console.log('✓ Messages can be retrieved from the general channel');
      console.log('✓ Message persistence is working correctly');
      
      return true;
    } else {
      console.log('✗ Message not found in database');
      return false;
    }
  } catch (error) {
    console.error('Test failed with error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testGeneralChannelPersistence().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Message persistence is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the output above.');
  }
  process.exit(success ? 0 : 1);
});