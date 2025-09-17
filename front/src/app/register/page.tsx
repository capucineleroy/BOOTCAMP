import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="container max-w-md py-10">
      <h1 className="mb-4 text-2xl font-semibold">Creer un compte</h1>
      <RegisterForm />
      <p className="mt-4 text-xs text-neutral-600">
        Vous recevrez un email de confirmation apres l'inscription.
      </p>
    </div>
  );
}
