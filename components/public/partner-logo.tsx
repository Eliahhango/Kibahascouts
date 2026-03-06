"use client"

import Image from "next/image"
import { useState } from "react"

type PartnerLogoProps = {
  src: string
  alt: string
}

export function PartnerLogo({ src, alt }: PartnerLogoProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return null
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="80px"
      unoptimized={false}
      className="object-contain"
      onError={() => setFailed(true)}
    />
  )
}
