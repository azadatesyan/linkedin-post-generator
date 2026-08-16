import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import GeneratePostButton from "@/components/GeneratePostButton";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <>
      <GeneratePostButton />
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
    </>
  );
}
