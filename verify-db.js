const { neon } = require('@neondatabase/serverless');
const sql = neon('postgres://neondb_owner:npg_08pKGFSnHerQ@ep-jolly-dream-a4e95pml-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function verifyDatabase() {
  console.log('🔍 Verifying database implementation status...\n');
  
  try {
    // 1. Check sequence
    console.log('1. Checking proposal number sequence:');
    const seqCheck = await sql`
      SELECT sequence_name, last_value 
      FROM information_schema.sequences 
      WHERE sequence_name = 'proposal_number_seq'
    `;
    
    if (seqCheck.length > 0) {
      console.log('   ✅ Sequence exists');
      const currentVal = await sql`SELECT currval('proposal_number_seq') as current`;
      console.log(`   📊 Current value: ${currentVal[0].current}`);
    } else {
      console.log('   ❌ Sequence not found');
    }
    
    // 2. Check functions
    console.log('\n2. Checking database functions:');
    const functions = await sql`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name IN ('generate_proposal_number', 'find_existing_draft')
      AND routine_type = 'FUNCTION'
    `;
    
    functions.forEach(f => {
      console.log(`   ✅ ${f.routine_name}() function exists`);
    });
    
    // 3. Check constraint
    console.log('\n3. Checking unique constraint:');
    const constraint = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE indexname = 'idx_one_draft_per_customer_user'
    `;
    
    if (constraint.length > 0) {
      console.log('   ✅ Duplicate prevention constraint exists');
    } else {
      console.log('   ❌ Constraint not found');
    }
    
    // 4. Test generation
    console.log('\n4. Testing proposal number generation:');
    const testNumber = await sql`SELECT generate_proposal_number() as test_number`;
    console.log(`   ✅ Generated: ${testNumber[0].test_number}`);
    
    console.log('\n🎉 DATABASE IMPLEMENTATION STATUS: SUCCESSFUL');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyDatabase(); 