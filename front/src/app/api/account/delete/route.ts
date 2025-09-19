import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

if (!serviceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Jeton d'authentification manquant." }, { status: 401 });
  }

  const accessToken = authHeader.slice(7).trim();
  if (!accessToken) {
    return NextResponse.json({ error: "Jeton d'authentification invalide." }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Impossible de verifier l'utilisateur." }, { status: 401 });
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
  if (deleteError) {
    console.error("Failed to delete account", deleteError);
    return NextResponse.json({ error: "Une erreur s'est produite lors de la suppression du compte." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
