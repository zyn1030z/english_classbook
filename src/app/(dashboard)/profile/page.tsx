import { getUserProfile } from "@/features/profile/actions";
import { ProfileClient } from "@/features/profile/components/profile-client";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
 const profile = await getUserProfile();
 if (!profile) redirect("/login");

 return <ProfileClient profile={profile} />;
}
