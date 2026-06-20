import Link from "next/link";
import { FileUp, Mic2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
 return (
 <div className="grid gap-3 sm:grid-cols-3">
 <Button asChild variant="outline" className="h-12 justify-start">
 <Link href="/lessons">
 <Plus className="h-4 w-4" />
 Add lesson
 </Link>
 </Button>
 <Button asChild variant="outline" className="h-12 justify-start">
 <Link href="/lessons">
 <FileUp className="h-4 w-4" />
 Import file
 </Link>
 </Button>
 <Button asChild variant="outline" className="h-12 justify-start">
 <Link href="/speaking">
 <Mic2 className="h-4 w-4" />
 Start speaking
 </Link>
 </Button>
 </div>
 );
}
