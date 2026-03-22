import dotenv from "dotenv";
dotenv.config();

export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const base = process.env.TEST_EMAIL || "jlloydbush@gmail.com";
  const [local, domain] = base.split("@");
  return `${local}+auto${timestamp}@${domain}`;
}

export function getTestMember() {
  return {
    firstName: process.env.TEST_FIRST_NAME || "Test",
    lastName: process.env.TEST_LAST_NAME || "Automation",
    email: generateUniqueEmail(),
    phone: process.env.TEST_PHONE || "5551234567",
    password: process.env.TEST_PASSWORD || "SecureTest8!",
    dob: process.env.TEST_DOB || "01-15-1990",
  };
}

export const StripeTestCards = {
  valid: {
    cardNumber: "4242424242424242",
    expiry: "12/30",
    cvc: "123",
    zip: "33180",
    email: "",
    phone: "5551234567",
  },
  declined: {
    cardNumber: "4000000000000002",
    expiry: "12/30",
    cvc: "123",
    zip: "33180",
    email: "",
    phone: "5551234567",
  },
} as const;

export const ScanOptions = {
  MRI_SCAN: { name: "MRI Scan", price: "$999" },
  MRI_SPINE: { name: "MRI Scan with Spine", price: "$1699" },
  MRI_SKELETAL: { name: "MRI Scan with Skeletal", price: "$3999" },
} as const;

export type ScanOption = (typeof ScanOptions)[keyof typeof ScanOptions];
export type StripeCard = (typeof StripeTestCards)[keyof typeof StripeTestCards];