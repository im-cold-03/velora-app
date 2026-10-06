import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
})

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    // Bypassing TS options validation via type assertion
    const params: any = {
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
    }

    const paymentIntent = await stripe.paymentIntents.create(params)

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error: any) {
    console.error('Stripe PaymentIntent Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}