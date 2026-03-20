"use client";

import { useMutation } from "@tanstack/react-query";
import {
  SUPABASE_STORAGE_BUCKET_AVATARS,
  SUPABASE_TABLE_PROFILES,
} from "@/constants/supabase";
import type { UpdateProfileMutationInput } from "@/types/mutations";
import { createClient } from "@/utils/supabase-browser";
import { sanitizeUsername } from "@/utils/username";

export async function updateProfileMutationFn(
  vars: UpdateProfileMutationInput
): Promise<void> {
  const supabase = createClient();
  let newAvatarUrl: string | null = vars.existingAvatarUrl;

  if (vars.newAvatarFile) {
    const fileExt = vars.newAvatarFile.name.split(".").pop();
    const fileName = `${vars.profileId}/avatar-${Date.now()}.${fileExt}`;

    if (vars.existingAvatarUrl) {
      const marker = `/${SUPABASE_STORAGE_BUCKET_AVATARS}/`;
      const oldPath = vars.existingAvatarUrl.split(marker)[1];
      if (oldPath) {
        await supabase.storage.from(SUPABASE_STORAGE_BUCKET_AVATARS).remove([oldPath]);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET_AVATARS)
      .upload(fileName, vars.newAvatarFile);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET_AVATARS)
      .getPublicUrl(fileName);

    newAvatarUrl = urlData.publicUrl;
  } else if (vars.removeStoredAvatar && vars.existingAvatarUrl) {
    const marker = `/${SUPABASE_STORAGE_BUCKET_AVATARS}/`;
    const oldPath = vars.existingAvatarUrl.split(marker)[1];
    if (oldPath) {
      await supabase.storage.from(SUPABASE_STORAGE_BUCKET_AVATARS).remove([oldPath]);
    }
    newAvatarUrl = null;
  }

  const { error: updateError } = await supabase
    .from(SUPABASE_TABLE_PROFILES)
    .update({
      username: sanitizeUsername(vars.username),
      display_name: vars.displayName || null,
      bio: vars.bio || null,
      avatar_url: newAvatarUrl,
      grid_ratio: vars.gridRatio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vars.profileId);

  if (updateError) throw updateError;
}

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: updateProfileMutationFn,
  });
}
