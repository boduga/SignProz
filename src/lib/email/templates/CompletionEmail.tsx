import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface CompletionEmailProps {
  documentTitle: string
  ownerName: string
  signerCount: number
  signedAt: string
}

export function CompletionEmail({
  documentTitle,
  ownerName,
  signerCount,
  signedAt,
}: CompletionEmailProps) {
  const date = new Date(signedAt).toLocaleString()

  return (
    <Html>
      <Head />
      <Preview>Document signed: {documentTitle}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Document Completed</Heading>
          <Text style={styles.text}>Hi {ownerName},</Text>
          <Text style={styles.text}>
            All <strong>{signerCount}</strong> signer{signerCount !== 1 ? 's' : ''} have completed
            signing <strong>{documentTitle}</strong>.
          </Text>
          <Text style={styles.text}>
            Completed at: <strong>{date}</strong>
          </Text>
          <Text style={styles.text}>
            You can view and download the signed document from your SignProz dashboard.
          </Text>
          <Text style={styles.footer}>— The SignProz Team</Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: { backgroundColor: '#f0fdf4', fontFamily: 'sans-serif' },
  container: { maxWidth: '560px', margin: '0 auto', padding: '32px 16px' },
  heading: { fontSize: '24px', color: '#059669', marginBottom: '24px' },
  text: { fontSize: '16px', color: '#374151', lineHeight: '1.5' },
  footer: { fontSize: '14px', color: '#9ca3af', marginTop: '32px' },
}
