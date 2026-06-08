import prisma from './src/lib/prisma.js';
import { createRequest, updateRequestStatus } from './src/controllers/freezingRequestController.js';

// Setup Mock Res
function makeMockRes(callback) {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      callback(this.statusCode, data);
    }
  };
}

async function runTests() {
  try {
    const testStudentId = 'BEA-ST-GEN-260220-102';

    // 1. Clear any existing requests for this student so we start fresh
    console.log("Cleaning up old test requests...");
    await prisma.freezing_requests.deleteMany({
      where: { student_id: testStudentId }
    });

    // 2. Test Case 1: Create a normal freezing request (under 30 days)
    console.log("\n--- TEST 1: Creating a normal request (10 days) ---");
    const req1 = {
      body: {
        reason: 'medical',
        start_date: '2026-06-10',
        end_date: '2026-06-20',
        description: 'Need to recover'
      },
      user: { userId: testStudentId }
    };
    
    let responsePromise1 = new Promise((resolve) => {
      const res1 = makeMockRes((code, data) => resolve({ code, data }));
      createRequest(req1, res1);
    });

    const res1 = await responsePromise1;
    console.log("Response Code:", res1.code);
    console.log("Response Body:", res1.data);

    if (res1.code !== 201) {
      throw new Error(`Test 1 Failed: Expected status 201, got ${res1.code}`);
    }
    const createdRequestId = res1.data.id;

    // 3. Test Case 2: Create a second request that exceeds the 30-day limit
    console.log("\n--- TEST 2: Creating a limit-exceeding request (35 days) ---");
    const req2 = {
      body: {
        reason: 'travel',
        start_date: '2026-07-01',
        end_date: '2026-08-05',
        description: 'Summer holiday'
      },
      user: { userId: testStudentId }
    };

    let responsePromise2 = new Promise((resolve) => {
      const res2 = makeMockRes((code, data) => resolve({ code, data }));
      createRequest(req2, res2);
    });

    const res2 = await responsePromise2;
    console.log("Response Code:", res2.code);
    console.log("Response Body:", res2.data);

    if (res2.code !== 422 || !res2.data.auto_rejected) {
      throw new Error(`Test 2 Failed: Expected auto-rejected status 422, got ${res2.code}`);
    }
    console.log("Auto-reject validated successfully!");

    // 4. Test Case 3: Admin status update (PATCH request)
    console.log("\n--- TEST 3: Admin updates status of request 1 to approved ---");
    const req3 = {
      params: { id: String(createdRequestId) },
      body: {
        status: 'approved',
        admin_response: 'Get well soon!'
      }
    };

    let responsePromise3 = new Promise((resolve) => {
      const res3 = makeMockRes((code, data) => resolve({ code, data }));
      updateRequestStatus(req3, res3);
    });

    const res3 = await responsePromise3;
    console.log("Response Code:", res3.code);
    console.log("Response Body:", res3.data);

    if (res3.code !== 200) {
      throw new Error(`Test 3 Failed: Expected status 200, got ${res3.code}`);
    }
    console.log("Admin approval validated successfully!");

    // 5. Verification: Check the final database state of requests
    console.log("\n--- Database Verification ---");
    const dbRequests = await prisma.freezing_requests.findMany({
      where: { student_id: testStudentId },
      orderBy: { created_at: 'asc' }
    });
    console.log("Requests in DB:");
    console.dir(dbRequests, { depth: null });

    // Clean up
    console.log("\nCleaning up test entries...");
    await prisma.freezing_requests.deleteMany({
      where: { student_id: testStudentId }
    });

    console.log("All tests passed successfully!");
  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
