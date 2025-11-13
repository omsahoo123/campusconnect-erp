
import { GraduationCap, Loader2 } from "lucide-react";
import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <GraduationCap {...props} />
  ),
  spinner: (props: SVGProps<SVGSVGElement>) => (
    <Loader2 {...props} />
  )
};
