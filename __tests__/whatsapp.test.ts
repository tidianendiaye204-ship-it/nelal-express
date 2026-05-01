import { describe, it, expect } from 'vitest'
import { buildMessage } from '../lib/whatsapp'

describe('WhatsApp buildMessage', () => {
  it('should build order_confirmed message correctly', () => {
    const data = {
      orderId: 'a1b2c3d4-xxxx-xxxx',
      clientName: 'Moussa',
      clientPhone: '771234567',
      recipientName: 'Fatou',
      recipientPhone: '779876543',
      description: 'Colis test',
      zoneFrom: 'Dakar',
      zoneTo: 'Pikine',
      price: 2500,
      trackingUrl: 'https://nelalexpress.com/suivi/123'
    }
    
    const message = buildMessage('order_confirmed', data)
    
    expect(message).toContain('A1B2C3D4')
    expect(message).toContain('Moussa')
    expect(message).toContain('Colis test')
    expect(message).toContain('2\u202F500') // 2 500 formatted with non-breaking space
  })
})
