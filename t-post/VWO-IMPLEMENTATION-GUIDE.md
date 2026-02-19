# VWO Post-Type Filter Implementation Guide

## Overview

This A/B test removes the "Post Type" column from the product table and filters products to show only those with "Intermediate" post-type values. This is designed to test the impact of removing poorly-selling product types on conversion rates.

## Files Created

1. **`vwo-post-type-filter.js`** - Full development version with detailed logging and debugging
2. **`vwo-post-type-filter-production.js`** - Minified production version for VWO
3. **`VWO-IMPLEMENTATION-GUIDE.md`** - This documentation file

## VWO Implementation Steps

### Step 1: Create A/B Test in VWO

1. Log into your VWO account
2. Create a new A/B test
3. Set the target URL to match your product category pages (e.g., pages containing the product table)
4. Name the test: "Post-Type Filter - Remove Non-Intermediate Products"

### Step 2: Add Custom JavaScript

1. In VWO, go to the "Variations" section
2. Create a new variation called "Hide Non-Intermediate Products"
3. Click "Edit" on the variation
4. Go to the "Custom JavaScript" section
5. Copy the entire contents of `vwo-post-type-filter-production.js`
6. Paste it into the custom JavaScript field

### Step 3: Configure Test Settings

**Targeting:**
- URL: Contains your product category page paths
- Device: All devices (or specify if needed)
- Browser: All browsers

**Goals:**
- Primary: Conversion rate (add to cart, purchases)
- Secondary: Engagement metrics (time on page, bounce rate)

**Traffic Allocation:**
- 50% Control (original page)
- 50% Variation (with post-type filter)

## What the Script Does

### 1. Column Removal
- Identifies the "Post Type" column in the product table
- Hides the column header (`<th>` element)
- Hides the corresponding filter dropdown
- Hides all post-type data cells in product rows

### 2. Product Filtering
- Scans all product rows for post-type values
- Hides products with post-type values other than "Intermediate"
- Keeps only products with "Intermediate" post-type visible

### 3. System Integration
- Updates filter counts to reflect only visible products
- Maintains row striping (odd/even styling)
- Updates banner colspan to account for removed column
- Preserves existing filtering and sorting functionality

### 4. VWO Compatibility
- Detects VWO environment automatically
- Waits for VWO to be ready before executing
- Tracks execution with VWO events
- Handles timing issues with DOM loading

## Technical Details

### Targeted Elements

The script targets these specific elements in the WordPress plugin:

- **Table**: `table.which-mesh-category`
- **Headers**: `thead tr:first-child th`
- **Filters**: `#aira_ajax_filters td`
- **Product Rows**: `#aira_ajax_products .table_string`

### Integration Points

The script integrates with existing functionality:

- **Filter System**: Updates counts and maintains filtering logic
- **Row Striping**: Reapplies odd/even row styling
- **Banner System**: Adjusts colspan for gabion banners
- **URL Filtering**: Preserves hash-based filter parameters

### Error Handling

- Graceful fallback if post-type column not found
- Retry mechanism if table not loaded yet
- Safe execution in non-VWO environments
- Console logging for debugging (disabled in production)

## Testing Checklist

Before launching the A/B test, verify:

### ✅ Functionality Tests
- [ ] Post-type column is completely hidden
- [ ] Only intermediate products are visible
- [ ] Other filters still work correctly
- [ ] Sorting functionality is preserved
- [ ] Filter counts update properly
- [ ] Row striping applies correctly
- [ ] Banner positioning works (if applicable)

### ✅ VWO Integration Tests
- [ ] Script executes in VWO preview
- [ ] No JavaScript errors in console
- [ ] VWO tracking events fire correctly
- [ ] Test works across different browsers
- [ ] Mobile responsiveness maintained

### ✅ Performance Tests
- [ ] Page load time not significantly impacted
- [ ] No visible flashing or layout shifts
- [ ] Smooth execution on slower connections

## Monitoring and Analytics

### Key Metrics to Track

**Conversion Metrics:**
- Add to cart rate
- Purchase conversion rate
- Average order value
- Revenue per visitor

**Engagement Metrics:**
- Time on page
- Bounce rate
- Pages per session
- Filter usage

**Product Metrics:**
- Products viewed per session
- Product detail page visits
- Search/filter interactions

### VWO Event Tracking

The script automatically tracks:
- `post_type_filter_applied` - When the filter executes successfully

You can add additional tracking in VWO for:
- Product interactions
- Filter usage
- Add to cart events

## Troubleshooting

### Common Issues

**Script Not Executing:**
- Check VWO targeting conditions
- Verify page contains the target table
- Check browser console for errors

**Column Still Visible:**
- Verify post-type column exists and has correct naming
- Check if table structure matches expectations
- Enable debug mode to see detailed logs

**Products Not Filtered:**
- Confirm products have post-type attribute values
- Verify "Intermediate" spelling and case
- Check if products are being loaded dynamically

### Debug Mode

To enable debugging:
1. Use the development version (`vwo-post-type-filter.js`)
2. Change `debug: false` to `debug: true`
3. Check browser console for detailed logs

### Support

For technical issues:
1. Check browser console for error messages
2. Verify VWO is loading correctly on the page
3. Test the script in isolation outside of VWO
4. Contact VWO support for platform-specific issues

## Expected Results

### Hypothesis
Removing non-intermediate post-type products will:
- Reduce choice overload for customers
- Increase focus on better-selling products
- Improve conversion rates
- Reduce bounce rates

### Success Criteria
- **Primary**: 5%+ increase in conversion rate
- **Secondary**: Improved engagement metrics
- **Tertiary**: No significant decrease in revenue per visitor

### Timeline
- **Test Duration**: 2-4 weeks minimum
- **Statistical Significance**: 95% confidence level
- **Sample Size**: Based on current traffic and conversion rates

## Rollback Plan

If the test shows negative results:
1. Stop the VWO test immediately
2. All traffic returns to original experience
3. No permanent changes to the website
4. Analyze results and iterate if needed

The beauty of this VWO implementation is that it's completely reversible and doesn't require any changes to the actual WordPress plugin code.




