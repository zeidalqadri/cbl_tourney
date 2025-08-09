# 📋 Manual Airtable Webhook Setup

## Fix the Automation

1. **Go to Automations tab** in your Airtable base

2. **Click on the automation** that was just created

3. **Fix the Trigger**:
   - Click on the trigger
   - Table: Select `venue_status` from dropdown
   - Add condition: When `status_changed` is ✓ (checked)
   - Test trigger → Should find records

4. **Add the Action**:
   - Click "+ Add action"
   - Choose "Run a script" (since webhook isn't available)
   
5. **Use this script** instead of webhook:

```javascript
// Get the record that triggered this automation
let inputConfig = input.config();
let record = inputConfig.record;

// Prepare the data
let coverageData = {
    venue: record.getCellValue('venue'),
    contentType: record.getCellValue('content_type'),
    status: record.getCellValue('status'),
    updatedBy: record.getCellValue('updated_by') || 'airtable'
};

// Send to your Cloudflare Worker
let response = await fetch('https://cbl-coverage-api.zeidalqadri.workers.dev/api/coverage/update', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(coverageData)
});

if (response.ok) {
    console.log('✅ Coverage updated successfully');
    
    // Mark as processed
    await base.getTable('venue_status').updateRecordAsync(record.id, {
        'processed': true,
        'processed_at': new Date().toISOString()
    });
} else {
    console.error('❌ Failed to update coverage');
}
```

6. **Configure Input Variables**:
   - Click "Add input variable"
   - Name: `record`
   - Value: Select the record from trigger

7. **Test the automation**:
   - Click "Test" button
   - Should see "✅ Coverage updated successfully"

## Alternative: Use Zapier/Make (Free)

If the script doesn't work, use:

1. **Zapier** (free tier):
   - Trigger: Airtable - New Record
   - Action: Webhooks - POST
   - URL: Your Worker endpoint

2. **Make.com** (free tier):
   - Same setup as Zapier
   - More generous free limits

## Test Your Setup

1. In Airtable, find a venue record
2. Check ✓ the `status_changed` box
3. Change status to "Video Ready"
4. Wait 5 seconds
5. Check your API: 
   ```
   curl https://cbl-coverage-api.zeidalqadri.workers.dev/api/coverage
   ```

The venue should show as updated!