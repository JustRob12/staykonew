"use client";

import { useTransition, useState, useRef } from "react";
import { updateUserProfile } from "../profile-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Facebook, Instagram, Music2, CheckCircle2, Loader2, Camera, User, Phone as PhoneIcon, Pencil, X as CancelIcon } from "lucide-react";

interface ProfileFormProps {
    initialProfile: any;
    initialSocialMedia: any;
}

export default function ProfileForm({ initialProfile, initialSocialMedia }: ProfileFormProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile?.avatar_url || null);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        setStatus(null);
        startTransition(async () => {
            const result = await updateUserProfile(formData);
            if (result.error) {
                setStatus({ type: 'error', message: result.error });
            } else {
                setStatus({ type: 'success', message: result.message || 'Saved successfully!' });
                setIsEditing(false);
            }
        });
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setAvatarPreview(initialProfile?.avatar_url || null);
        formRef.current?.reset();
        setStatus(null);
    };

    return (
        <form ref={formRef} action={handleSubmit} className="p-10 space-y-10 relative">
            {/* Edit Toggle Button */}
            {!isEditing && (
                <div className="absolute top-8 right-8 z-30">
                    <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-2xl shadow-xl shadow-green-200 transition-all hover:scale-[1.05] active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                        <Pencil className="h-4 w-4" />
                        <span>Edit Profile</span>
                    </Button>
                </div>
            )}

            {/* Avatar Section */}
            <div className={`flex flex-col items-center justify-center space-y-4 pb-4 border-b border-gray-100 ${!isEditing ? 'opacity-90' : ''}`}>
                <div
                    className={`relative group ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => isEditing && fileInputRef.current?.click()}
                >
                    <div className="relative h-32 w-32 rounded-full bg-green-50 border-4 border-white shadow-xl overflow-hidden transition-transform group-hover:scale-105 active:scale-95">
                        {avatarPreview ? (
                            <Image
                                src={avatarPreview}
                                alt="Avatar Preview"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-green-700">
                                <User className="h-12 w-12" />
                            </div>
                        )}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        )}
                    </div>
                    {isEditing && (
                        <div className="absolute -right-2 -bottom-2 bg-green-600 p-2.5 rounded-2xl text-white shadow-lg border-4 border-white transform group-hover:rotate-12 transition-transform">
                            <Camera className="h-4 w-4" />
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">Profile Picture</p>
                    {isEditing ? (
                        <p className="text-xs text-green-600 font-bold animate-pulse">Click to upload new</p>
                    ) : (
                        <p className="text-xs text-gray-500 font-medium">Locked</p>
                    )}
                </div>
                <input
                    type="file"
                    name="avatar"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={!isEditing}
                />
                <input type="hidden" name="current_avatar_url" value={initialProfile?.avatar_url || ""} />
            </div>

            {/* Basic Info */}
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                    <Label htmlFor="full_name" className="text-gray-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        Full Name
                    </Label>
                    <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={initialProfile?.full_name || ""}
                        placeholder="Your full name"
                        disabled={!isEditing}
                        className={`h-14 px-5 rounded-2xl border-gray-100 bg-gray-50 font-medium transition-all ${isEditing ? 'focus:bg-white focus:ring-green-500/10 focus:border-green-500 bg-white border-green-200' : 'cursor-not-allowed opacity-75'
                            }`}
                    />
                </div>
                <div className="space-y-3">
                    <Label htmlFor="phone_number" className="text-gray-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <PhoneIcon className="h-3.5 w-3.5" />
                        Phone Number
                    </Label>
                    <Input
                        id="phone_number"
                        name="phone_number"
                        defaultValue={initialProfile?.phone_number || ""}
                        placeholder="09xx xxx xxxx"
                        disabled={!isEditing}
                        className={`h-14 px-5 rounded-2xl border-gray-100 bg-gray-50 font-medium transition-all ${isEditing ? 'focus:bg-white focus:ring-green-500/10 focus:border-green-500 bg-white border-green-200' : 'cursor-not-allowed opacity-75'
                            }`}
                    />
                </div>
                <div className="space-y-3 md:col-span-2">
                    <Label className="text-gray-500 font-bold text-xs uppercase tracking-widest">Email Address (Read Only)</Label>
                    <div className="h-14 px-5 flex items-center bg-gray-100/50 rounded-2xl border border-gray-100 text-gray-500 font-medium lowercase">
                        {initialProfile?.email || "No email set"}
                    </div>
                </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Social Media Section */}
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1.5 bg-green-500 rounded-full" />
                    <h3 className="text-xl font-black text-gray-900">Social Presence</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-3">
                        <Label htmlFor="facebook" className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase tracking-widest">
                            <Facebook className="h-4 w-4 text-blue-600" />
                            Facebook
                        </Label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                            <Input
                                id="facebook"
                                name="facebook"
                                defaultValue={initialSocialMedia?.facebook || ""}
                                placeholder="username"
                                disabled={!isEditing}
                                className={`h-14 pl-10 rounded-2xl border-gray-100 bg-gray-50 font-medium transition-all ${isEditing ? 'focus:bg-white focus:ring-green-500/10 focus:border-green-500 bg-white border-green-200' : 'cursor-not-allowed opacity-75'
                                    }`}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="instagram" className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase tracking-widest">
                            <Instagram className="h-4 w-4 text-pink-600" />
                            Instagram
                        </Label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                            <Input
                                id="instagram"
                                name="instagram"
                                defaultValue={initialSocialMedia?.instagram || ""}
                                placeholder="username"
                                disabled={!isEditing}
                                className={`h-14 pl-10 rounded-2xl border-gray-100 bg-gray-50 font-medium transition-all ${isEditing ? 'focus:bg-white focus:ring-green-500/10 focus:border-green-500 bg-white border-green-200' : 'cursor-not-allowed opacity-75'
                                    }`}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="tiktok" className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase tracking-widest">
                            <Music2 className="h-4 w-4 text-black" />
                            TikTok
                        </Label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                            <Input
                                id="tiktok"
                                name="tiktok"
                                defaultValue={initialSocialMedia?.tiktok || ""}
                                placeholder="username"
                                disabled={!isEditing}
                                className={`h-14 pl-10 rounded-2xl border-gray-100 bg-gray-50 font-medium transition-all ${isEditing ? 'focus:bg-white focus:ring-green-500/10 focus:border-green-500 bg-white border-green-200' : 'cursor-not-allowed opacity-75'
                                    }`}
                            />
                        </div>
                    </div>
                </div>
                <p className="mt-6 p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 font-medium flex items-center gap-2 border border-gray-100">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Enter your usernames and we'll handle the links automatically for your property listings.
                </p>
            </div>

            {status && (
                <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 border ${status.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-100 shadow-sm shadow-green-100'
                    : 'bg-red-50 text-red-700 border-red-100 shadow-sm shadow-red-100'
                    }`}>
                    {status.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                    <span className="text-sm font-bold tracking-tight">{status.message}</span>
                </div>
            )}

            <div className="flex justify-end gap-4 pt-6">
                {isEditing && (
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isPending}
                            className="h-16 px-10 rounded-[1.5rem] border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <CancelIcon className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="h-16 bg-green-600 hover:bg-green-700 text-white font-black px-10 rounded-[1.5rem] shadow-xl shadow-green-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {isPending ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Saving Changes...</span>
                                </div>
                            ) : 'Update Profile'}
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
}
