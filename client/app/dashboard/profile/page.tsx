import { getSocialMedia } from "../profile-actions";
import ProfileForm from "./ProfileForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Map as MapIcon, ChevronLeft } from "lucide-react";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch profile details too
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const socialMedia = await getSocialMedia();

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-gray-900">Your Profile</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage your identity and social connections.</p>
                </div>

                <a
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3 rounded-2xl text-sm font-bold text-gray-700 shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all active:scale-[0.98]"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <MapIcon className="h-4 w-4 text-green-600" />
                    <span>Back to Map</span>
                </a>
            </div>

            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <ProfileForm initialProfile={profile} initialSocialMedia={socialMedia} />
            </div>
        </div>
    );
}
