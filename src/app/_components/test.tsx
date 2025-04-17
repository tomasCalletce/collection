"use client";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export const Test = () => {
  const { mutate } = api.inquiry.test.useMutation();

  return (
    <Button
      onClick={() =>
        mutate({ initiative_id: "8dd0f996-c021-4dcc-8dc3-c28c7ac92e05" })
      }
    >
      Test
    </Button>
  );
};
