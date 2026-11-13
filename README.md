# Wallet Wins Deals

Wallet Wins AI Prompt for Lovable

Create a modern affiliate deals website called Wallet Wins.

The website should look like a combination of SlickDeals, Brad's Deals, and Amazon Deals pages, but with a cleaner modern design optimized for mobile users.

The goal is to help users discover the best sales, discounts, clearance deals, and limited-time offers from major retailers.

Use a modern responsive design with excellent mobile performance.

Brand

Website Name:

Wallet Wins

Tagline:

The Best Deals. Updated Daily.

Theme:

Modern
Clean
Trustworthy
Deal-focused
Savings-oriented

Primary Colors:

Green (#22c55e)
Black
White
Light Gray

Homepage

Create a homepage with the following sections:

Hero Section

Headline:

Save More Every Day

Subheadline:

Discover the best deals, discounts, and price drops from hundreds of trusted retailers.

CTA Button:

Browse Deals

Featured Deals Section

Show cards with:

Product Image
Product Name
Current Price
Original Price
Percent Off
Retailer
Get Deal Button

Display in responsive grid.

Trending Retailers

Show retailer logos/cards:

Amazon
Walmart
Target
Best Buy
Nike
Dyson
Macy's
Home Depot

Each retailer should link to a retailer page.

Popular Categories

Show category cards:

Electronics
Home
Kitchen
Beauty
Fashion
Outdoor
Toys
Fitness

Recent Price Drops

Show newest deals sorted by highest discount.

Deals Page

Create a dedicated deals page.

Filters:

Search
Retailer
Category
Price Range
Discount Percentage
Sort By

Sort Options:

Best Deals
Newest
Highest Discount
Lowest Price

Deal cards should contain:

Image
Product Name
Retailer
Price
Original Price
Savings
Deal Score
Get Deal Button

Deal Detail Page

Create a dynamic deal page.

Display:

Large Product Image
Product Name
Current Price
Original Price
Savings Amount
Discount Percentage
Retailer
Category

Prominent CTA:

Get This Deal

When clicked:

Open affiliate link

Show:

Related Deals
Similar Products
More From This Retailer

Retailer Pages

Create dynamic retailer pages.

Example:

/retailer/amazon
/retailer/walmart
/retailer/nike

Display:

Retailer Name
Logo
Active Deals
Top Discounts
Recent Deals

Category Pages

Create dynamic category pages.

Examples:

/category/electronics
/category/home
/category/fashion

Show:

All deals in category
Sorting
Filtering

Search

Implement global search.

Search fields:

Product Name
Retailer
Category

Newsletter

Create email signup section.

Headline:

Never Miss a Deal

Fields:

Email Address
Subscribe Button

SEO

Generate SEO-friendly pages.

Every deal page should include:

Meta Title
Meta Description
Open Graph Image
Structured Data

Use dynamic SEO based on product information.

Database Integration

Connect to Supabase.

Primary table:

deals_to_post

Fields:

product_name
image_url
product_url
price
original_price
discount
retailer
deal_score
category
created_at
status

Only display deals where:

status IN ('pending','queued')

Sort homepage by:

deal_score DESC

Affiliate Tracking

All "Get Deal" buttons should:

Open affiliate link
Track outbound click
Store click event

Create click tracking table:

affiliate_clicks

Columns:

id
product_fingerprint
retailer
clicked_at
referrer

Performance Dashboard

Create protected admin dashboard.

Metrics:

Total Deals
Deals Posted Today
Top Retailers
Top Categories
Recent Clicks

Technical Requirements

Use:

React
TypeScript
Tailwind CSS
Supabase
Responsive Design
Server-side Rendering
SEO Optimization

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://wallet-wins-deals.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d74a6a24-9ab0-4904-abee-631a39f15fb6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
