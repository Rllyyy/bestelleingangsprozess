"use client";

import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ActionState, addOrder } from "@/app/actions";

type OrderFormState = {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  orderedAt: string;
  price: string;
  itemPartName: string;
  itemArticleNumber: string;
  itemQuantity: number;
};

const initialFormState: OrderFormState = {
  customerName: "",
  customerEmail: "",
  customerAddress: "",
  orderedAt: "",
  price: "",
  itemPartName: "",
  itemArticleNumber: "",
  itemQuantity: 1,
};

const initialState: ActionState = {
  data: initialFormState,
  error: null,
  success: false,
};

export default function AddOrderDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>+ New Order</Button>
      </DialogTrigger>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Create Order</DialogTitle>
          <DialogDescription className='sr-only'>
            Fill in customer details, order status, and one item to create a new order.
          </DialogDescription>
        </DialogHeader>

        <form
          className='grid gap-4'
          action={(formData) => {
            startTransition(async () => {
              const result = await addOrder(state, formData);
              setState(result);

              if (result?.success) {
                setIsOpen(false);
                setState(initialState);
              }
            });
          }}
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='customerName'>Customer name</Label>
              <Input
                id='customerName'
                defaultValue={state.data?.customerName || ""}
                placeholder='Max Mustermann'
                name='customerName'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='customerEmail'>Customer email *</Label>
              <Input
                id='customerEmail'
                name='customerEmail'
                type='email'
                defaultValue={state.data?.customerEmail || ""}
                placeholder='max@example.com'
                required
              />
            </div>

            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor='customerAddress'>Customer address</Label>
              <Input
                id='customerAddress'
                name='customerAddress'
                defaultValue={state.data?.customerAddress}
                placeholder='Street, ZIP, City'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='orderedAt'>Ordered at *</Label>
              <Input
                id='orderedAt'
                name='orderedAt'
                type='datetime-local'
                defaultValue={state.data?.orderedAt}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='price'>Price</Label>
              <Input
                id='price'
                name='price'
                type='number'
                inputMode='decimal'
                step='0.01'
                defaultValue={state.data?.price as string}
                placeholder='105.98'
              />
            </div>
          </div>

          <div className='mt-2 rounded border p-4'>
            <div className='mb-3 font-medium'>Item</div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='grid gap-2'>
                <Label htmlFor='itemPartName'>Part name</Label>
                <Input
                  id='itemPartName'
                  name='itemPartName'
                  defaultValue={state.data?.itemPartName}
                  placeholder='Schraube'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='itemArticleNumber'>Article number</Label>
                <Input
                  id='itemArticleNumber'
                  name='itemArticleNumber'
                  defaultValue={state.data?.itemArticleNumber}
                  placeholder='12345'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='itemQuantity'>Quantity</Label>
                <Input
                  id='itemQuantity'
                  name='itemQuantity'
                  type='number'
                  min={1}
                  defaultValue={state.data?.itemQuantity as string}
                />
              </div>
            </div>
          </div>

          {state.error ? <p className='text-destructive'>{state.error}</p> : null}

          <div className='flex justify-end gap-2'>
            <Button type='submit' disabled={isPending}>
              {isPending ? "Creating Order..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
