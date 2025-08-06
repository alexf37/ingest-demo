# Troubleshooting Auto-Generation

## How to Debug Form Population Issues

1. **Open the browser console** (F12 or right-click → Inspect → Console)

2. **Click the "Auto-generate" button** on any tab

3. **Look for console logs** that show:
   - "Event generation object:" (or Document/Email)
   - The object being streamed from the API

## Common Issues

### Form fields not updating

- Check that the object has the expected properties
- Verify that the field names match between the schema and form fields
- Ensure the form is not in a submitting state

### API errors

- Check the Network tab for the `/api/generate/*` request
- Verify the OPENAI_API_KEY is set in your .env file
- Check that the response is a valid Server-Sent Events stream

### Type mismatches

- Array fields (attendees, tags, cc) should contain valid strings
- DateTime fields should be in ISO format
- Email fields should contain valid email addresses

## Testing the API Directly

You can test the generation endpoints directly:

```bash
# Test event generation
curl -N http://localhost:3000/api/generate/event

# Test document generation
curl -N http://localhost:3000/api/generate/document

# Test email generation
curl -N http://localhost:3000/api/generate/email
```

The response should be a Server-Sent Events stream that ends with a complete JSON object.
