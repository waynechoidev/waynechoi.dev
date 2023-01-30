import { headerMenu } from "@/constant";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import React, { ReactElement } from "react";

const date = new Date();

interface LayoutProps {
  children: ReactElement;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Stack
        component="header"
        gap={3}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "left",
          alignItems: "baseline",
        }}
      >
        <Link href={"/"}>
          <Typography variant="h4" gutterBottom>
            WayneChoi.dev
          </Typography>
        </Link>
        {headerMenu.map((menu) => (
          <Link href={menu.href} key={menu.label}>
            <Typography>{menu.label}</Typography>
          </Link>
        ))}
      </Stack>
      <section>{children}</section>
      <footer>
        (C) {date.getFullYear()}. Wonjun Choi. All rights reserved.
      </footer>
    </>
  );
}
