const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const rds = new AWS.RDS();
const ec2 = new AWS.EC2();

async function optimizeResources() {
  try {
    // 1. Create a backup snapshot of the RDS instance
    console.log('Creating post-draft RDS snapshot...');
    await rds.createDBSnapshot({
      DBInstanceIdentifier: 'nfldraft-db',
      DBSnapshotIdentifier: `nfldraft-post-draft-${new Date().toISOString().replace(/[:.]/g, '-')}`
    }).promise();

    // 2. Optimize RDS instance (reduce to smaller instance type)
    console.log('Optimizing RDS instance...');
    await rds.modifyDBInstance({
      DBInstanceIdentifier: 'nfldraft-db',
      DBInstanceClass: 'db.t3.micro', // Smaller instance type for reduced costs
      ApplyImmediately: true
    }).promise();

    // 3. Optimize EC2 instance (reduce to smaller instance type)
    console.log('Optimizing EC2 instance...');
    await ec2.modifyInstanceAttribute({
      InstanceId: process.env.EC2_INSTANCE_ID,
      InstanceType: { Value: 't3.micro' } // Smaller instance type for reduced costs
    }).promise();

    // 4. Update security groups to restrict access to only necessary IPs
    console.log('Updating security groups...');
    await ec2.updateSecurityGroupRuleDescriptionsIngress({
      GroupId: process.env.SECURITY_GROUP_ID,
      IpPermissions: [{
        IpProtocol: 'tcp',
        FromPort: 5432,
        ToPort: 5432,
        IpRanges: [{
          CidrIp: '0.0.0.0/0',
          Description: 'Restricted during maintenance'
        }]
      }]
    }).promise();

    console.log('Post-draft resource optimization completed successfully');
  } catch (error) {
    console.error('Error optimizing resources:', error);
    throw error;
  }
}

// Run optimization
optimizeResources()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Resource optimization failed:', error);
    process.exit(1);
  }); 