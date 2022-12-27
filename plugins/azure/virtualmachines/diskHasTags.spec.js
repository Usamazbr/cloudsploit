var expect = require('chai').expect;
var diskHasTags = require('./diskHasTags');

const disks = [
    {
        'name': 'test',
        'id': '/subscriptions/123/resourceGroups/aqua-resource-group/providers/Microsoft.Compute/disks/test',
        'type': 'Microsoft.Compute/disks',
        'location': 'eastus',
        'tags': {'key': 'test'},
        'encryption': {
            'type': 'EncryptionAtRestWithPlatformKey'
        }
    },
    {
        'name': 'test',
        'id': '/subscriptions/123/resourceGroups/aqua-resource-group/providers/Microsoft.Compute/disks/test',
        'type': 'Microsoft.Compute/disks',
        'location': 'eastus',
        'encryption': {
            'type': 'EncryptionAtRestWithCustomerKey',
            'diskEncryptionSetId': '/subscriptions/123/resourceGroups/AQUA-RESOURCE-GROUP/providers/Microsoft.Compute/diskEncryptionSets/test-encrypt-set'
        }

    },
];

const createCache = (disks) => {
    const disk = {};
    if (disks) {
        disk['data'] = disks;
    }
    return {
        disks: {
            list: {
                'eastus': disk
            }
        }
    };
};

describe('diskHasTags', function() {
    describe('run', function() {
        it('should give passing result if no disk volumes found', function(done) {
            const cache = createCache([]);
            diskHasTags.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                expect(results[0].message).to.include('No existing disk volumes found');
                expect(results[0].region).to.equal('eastus');
                done();
            });
        });

        it('should give unknown result if unable to query for disk volumes', function(done) {
            const cache = createCache();
            diskHasTags.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(3);
                expect(results[0].message).to.include('Unable to query for virtual machine disk volumes');
                expect(results[0].region).to.equal('eastus');
                done();
            });
        });

        it('should give passing result if Disk volume has BYOK encryption enabled only', function(done) {
            const cache = createCache([disks[0]]);
            diskHasTags.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                expect(results[0].message).to.include('VM disk has tags');
                expect(results[0].region).to.equal('eastus');
                done();
            });
        });

        it('should give failing result if Disk volume has BYOK encryption disabled', function(done) {
            const cache = createCache([disks[1]]);
            diskHasTags.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(2);
                expect(results[0].message).to.include('VM disk does not have tags');
                expect(results[0].region).to.equal('eastus');
                done();
            });
        });
    });
});