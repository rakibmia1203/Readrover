"use client";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui";
import { useToast } from "@/components/toast/ToastProvider";

export default function AddToCartButton(props: { bookId: string; slug: string; title: string; price: number; coverUrl?: string | null; }) {
  const { add } = useCart();
  const { push } = useToast();
  return <Button onClick={() => { add(props, 1); push({ title: "Added to cart", desc: props.title, tone: "success" }); }} className="w-full">Add to cart</Button>;
}
