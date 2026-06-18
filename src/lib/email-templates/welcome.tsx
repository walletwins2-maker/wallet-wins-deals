import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  siteUrl?: string
}

const SITE_URL = 'https://walletwins.shop'

const WelcomeEmail = ({ siteUrl = SITE_URL }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to Wallet Wins — daily deals coming your way</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={hero}>
          <Heading style={brand}>Wallet Wins</Heading>
          <Text style={tagline}>Smart shopping. Real savings.</Text>
        </Section>
        <Section style={card}>
          <Heading as="h2" style={h2}>You're in!</Heading>
          <Text style={paragraph}>
            Thanks for subscribing. From now on, you'll get the best deals,
            price drops, and clearance finds delivered to your inbox.
          </Text>
          <Text style={paragraph}>
            Want to start hunting now? Browse today's top deals on the site.
          </Text>
          <Section style={{ textAlign: 'center', margin: '28px 0 8px' }}>
            <Button href={`${siteUrl}/deals`} style={button}>
              Browse today's deals
            </Button>
          </Section>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          You're receiving this email because you subscribed at walletwins.shop.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to Wallet Wins 🎉',
  displayName: 'Newsletter welcome',
  previewData: { siteUrl: SITE_URL },
} satisfies TemplateEntry

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 20px',
}

const hero: React.CSSProperties = {
  backgroundColor: '#0a1f14',
  borderRadius: '16px',
  padding: '28px 24px',
  textAlign: 'center',
  color: '#ffffff',
}

const brand: React.CSSProperties = {
  color: '#7ee49a',
  fontSize: '28px',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-0.02em',
}

const tagline: React.CSSProperties = {
  color: '#bcd9c5',
  fontSize: '13px',
  margin: '6px 0 0',
}

const card: React.CSSProperties = {
  padding: '28px 8px 8px',
}

const h2: React.CSSProperties = {
  color: '#0a1f14',
  fontSize: '22px',
  fontWeight: 700,
  margin: '0 0 12px',
}

const paragraph: React.CSSProperties = {
  color: '#2a3b32',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 14px',
}

const button: React.CSSProperties = {
  backgroundColor: '#22c55e',
  color: '#0a1f14',
  fontSize: '15px',
  fontWeight: 700,
  padding: '12px 22px',
  borderRadius: '999px',
  textDecoration: 'none',
  display: 'inline-block',
}

const hr: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '28px 0 16px',
}

const footer: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  textAlign: 'center',
  margin: 0,
}