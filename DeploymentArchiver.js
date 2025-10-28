class DeploymentArchiver {
  constructor() {
    this.maxActiveDeployments = 3;
  }

  async getDeployments() {
    try {
      const result = this.execClasp('deployments');
      const lines = result.split('\n').filter(line => line.trim().startsWith('-'));
      
      return lines.map(line => {
        const match = line.match(/- (AKfyc[^@\s]+)\s+@(\d+|\w+)(?:\s+-\s+(.*))?/);
        if (match) {
          const [, id, version, description] = match;
          return {
            id,
            version: version === 'HEAD' ? 999999 : parseInt(version) || 0,
            description: description || 'No description',
            isHead: version === 'HEAD'
          };
        }
        return null;
      }).filter(Boolean);
    } catch (error) {
      throw new Error(`Failed to get deployments: ${error.message}`);
    }
  }

  sortDeploymentsByVersion(deployments) {
    return deployments.sort((a, b) => {
      if (a.isHead) return -1;
      if (b.isHead) return 1;
      return b.version - a.version;
    });
  }

  identifyDeploymentsToArchive(deployments) {
    const sorted = this.sortDeploymentsByVersion(deployments);
    const toKeep = sorted.slice(0, this.maxActiveDeployments);
    const toArchive = sorted.slice(this.maxActiveDeployments);
    
    return {
      keep: toKeep,
      archive: toArchive
    };
  }

  async archiveDeployment(deploymentId) {
    try {
      const result = this.execClasp(`undeploy ${deploymentId}`);
      return {
        success: true,
        deploymentId,
        result: result.trim()
      };
    } catch (error) {
      return {
        success: false,
        deploymentId,
        error: error.message
      };
    }
  }

  async archiveOldDeployments() {
    console.log('🔍 Getting current deployments...');
    const deployments = await this.getDeployments();
    
    console.log(`📊 Found ${deployments.length} total deployments`);
    
    const { keep, archive } = this.identifyDeploymentsToArchive(deployments);
    
    console.log(`✅ Keeping ${keep.length} most recent deployments:`);
    keep.forEach(d => {
      const version = d.isHead ? 'HEAD' : `@${d.version}`;
      console.log(`   - ${d.id} ${version} - ${d.description}`);
    });
    
    if (archive.length === 0) {
      console.log('🎉 No deployments need archiving');
      return { kept: keep, archived: [] };
    }
    
    console.log(`🗂️  Archiving ${archive.length} old deployments:`);
    
    const archivedResults = [];
    for (const deployment of archive) {
      console.log(`   🗂️  Archiving ${deployment.id} @${deployment.version}...`);
      const result = await this.archiveDeployment(deployment.id);
      archivedResults.push(result);
      
      if (result.success) {
        console.log(`   ✅ Successfully archived ${deployment.id}`);
      } else {
        console.log(`   ❌ Failed to archive ${deployment.id}: ${result.error}`);
      }
    }
    
    const successfulArchives = archivedResults.filter(r => r.success);
    const failedArchives = archivedResults.filter(r => !r.success);
    
    console.log(`\n📈 Archive Summary:`);
    console.log(`   ✅ Successfully archived: ${successfulArchives.length}`);
    console.log(`   ❌ Failed to archive: ${failedArchives.length}`);
    console.log(`   📦 Total remaining: ${keep.length}`);
    
    return {
      kept: keep,
      archived: archivedResults
    };
  }

  execClasp(command) {
    const { execSync } = require('child_process');
    const path = require('path');
    try {
      // Always run clasp commands from v2-sheet-script directory
      const claspDir = path.join(__dirname, 'v2-sheet-script');
      return execSync(`clasp ${command}`, { 
        encoding: 'utf8',
        cwd: claspDir
      });
    } catch (error) {
      throw new Error(`Clasp command failed: ${error.message}`);
    }
  }

  async dryRun() {
    console.log('🧪 DRY RUN - No deployments will be deleted');
    const deployments = await this.getDeployments();
    const { keep, archive } = this.identifyDeploymentsToArchive(deployments);
    
    console.log(`\n📊 Current Status:`);
    console.log(`   Total deployments: ${deployments.length}`);
    console.log(`   Would keep: ${keep.length}`);
    console.log(`   Would archive: ${archive.length}`);
    
    console.log(`\n✅ Deployments to KEEP:`);
    keep.forEach(d => {
      const version = d.isHead ? 'HEAD' : `@${d.version}`;
      console.log(`   - ${d.id} ${version} - ${d.description}`);
    });
    
    if (archive.length > 0) {
      console.log(`\n🗂️  Deployments to ARCHIVE:`);
      archive.forEach(d => {
        console.log(`   - ${d.id} @${d.version} - ${d.description}`);
      });
    }
    
    return { keep, archive };
  }
}

if (require.main === module) {
  const archiver = new DeploymentArchiver();
  
  const isDryRun = process.argv.includes('--dry-run');
  
  (async () => {
    try {
      if (isDryRun) {
        await archiver.dryRun();
      } else {
        await archiver.archiveOldDeployments();
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = DeploymentArchiver;