// SEEDER DISABLED - No automatic user creation
// All users must be imported via Excel file

const seedDatabase = async () => {
  console.log('\n========================================');
  console.log('   DATABASE STATUS');
  console.log('========================================');
  console.log('ℹ️  No demo users created automatically');
  console.log('ℹ️  Please import users via Excel file');
  console.log('ℹ️  Use POST /api/admin/import-users endpoint');
  console.log('========================================\n');
};

module.exports = seedDatabase;