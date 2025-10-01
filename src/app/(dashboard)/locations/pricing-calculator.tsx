'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Screen } from '@/lib/types';

interface PricingCalculatorProps {
  selectedScreens: Screen[];
}

const ONE_SCREEN_ONE_MONTH = 2500;
const TWO_SCREENS_ONE_MONTH = 4500;
const ONE_SCREEN_THREE_MONTHS_PER_MONTH = 1500;
const TWO_SCREENS_THREE_MONTHS_PER_MONTH = 1250;

export function PricingCalculator({ selectedScreens }: PricingCalculatorProps) {
  const [slots, setSlots] = useState(1);
  const [duration, setDuration] = useState(1); // in months
  const [totalPrice, setTotalPrice] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculatePrice = () => {
      const numScreens = selectedScreens.length;
      if (numScreens === 0) {
        setTotalPrice(0);
        return;
      }

      let price = 0;
      if (duration === 1) {
        if (numScreens === 1) {
          price = ONE_SCREEN_ONE_MONTH * slots;
        } else {
          // Price for 2+ screens is a flat rate for the first 2, then per screen
          price = TWO_SCREENS_ONE_MONTH * slots + (numScreens - 2 > 0 ? (numScreens - 2) * ONE_SCREEN_ONE_MONTH * slots : 0);
        }
      } else if (duration === 3) {
        if (numScreens === 1) {
          price = ONE_SCREEN_THREE_MONTHS_PER_MONTH * slots * 3;
        } else {
          price = (TWO_SCREENS_THREE_MONTHS_PER_MONTH * slots + (numScreens - 2 > 0 ? (numScreens - 2) * ONE_SCREEN_THREE_MONTHS_PER_MONTH * slots : 0)) * 3;
        }
      }
      setTotalPrice(price);
    };

    calculatePrice();
  }, [selectedScreens, slots, duration]);

  useEffect(() => {
    const countdown = setInterval(() => {
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

        const now = new Date();
        const difference = twoDaysFromNow.getTime() - now.getTime();

        let timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
        };
        
        setTimeLeft(timeLeft);

    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const getPriceBreakdown = () => {
    if (selectedScreens.length === 0) return null;

    const perMonth = duration === 3 ? (totalPrice/3).toLocaleString() : totalPrice.toLocaleString();

    return (
      <div className='text-sm text-muted-foreground'>
        <p>Price per month: <span className='font-bold'>₹{perMonth}</span></p>
        {duration === 3 && <p>Total for 3 months: <span className='font-bold'>₹{totalPrice.toLocaleString()}</span></p>}
      </div>
    )

  }

  return (
    <Card className="w-full mt-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-dashed border-primary/50 shadow-lg">
      <CardHeader className='text-center'>
        <Badge variant="destructive" className='w-fit mx-auto animate-pulse'>Limited Time Offer!</Badge>
        <CardTitle className="text-2xl font-bold text-primary tracking-tight">Exclusive Pricing Calculator</CardTitle>
        <CardDescription>
            Ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className='text-center p-4 bg-primary/10 rounded-lg'>
              <Label className='text-lg font-semibold'>Selected Screens</Label>
              <p className="text-4xl font-extrabold text-primary">{selectedScreens.length}</p>
          </div>
          <div className='space-y-2'>
            <Label htmlFor="slots">Ad Slots (20 seconds each)</Label>
            <Select value={slots.toString()} onValueChange={(val) => setSlots(parseInt(val))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3].map(s => <SelectItem key={s} value={s.toString()}>{s} Slot{s > 1 ? 's' : ''}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor="duration">Campaign Duration</Label>
            <Select value={duration.toString()} onValueChange={(val) => setDuration(parseInt(val))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Month</SelectItem>
                <SelectItem value="3">3 Months (Discounted!)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-center bg-background p-6 rounded-lg shadow-inner">
            <p className='text-sm font-medium text-muted-foreground'>Estimated Total Price</p>
            <p className="text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                ₹{totalPrice.toLocaleString()}
            </p>
            {getPriceBreakdown()}
        </div>
      </CardContent>
    </Card>
  );
}
