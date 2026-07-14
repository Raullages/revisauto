"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

type PremiumFeatureGateProps = {
  title: string;
  description: string;
};

export function PremiumFeatureGate({ title, description }: PremiumFeatureGateProps) {
  return (
    <Card>
      <CardBody className="p-6 text-center">
        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          Premium
        </span>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <div className="mt-6 flex justify-center">
          <Link href="/premium">
            <Button>Ver plano Premium</Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
