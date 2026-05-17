import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";
import ImportDataButton from "./import-data-btn";
import DeleteDataButton from "./delete-data-btn";

export default async function Navbar() {
  return (
    <nav className='sticky top-0 z-50 w-full border-b border-gray-200 bg-background'>
      <div className='flex h-16 items-center px-4 mx-auto gap-4'>
        <Link href='/'>Home</Link>
        <Suspense>
          <User />
        </Suspense>
      </div>
    </nav>
  );
}

async function User() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <>
      {data?.claims ? (
        <>
          <ImportDataButton />
          <DeleteDataButton />
          <Link href='/' className='ml-auto'>
            <Button variant='ghost' className='text-gray-700 hover:text-black'>
              Orders
            </Button>
          </Link>
          <Link href='/dashboard'>
            <Button variant='ghost' className='text-gray-700 hover:text-black'>
              Dashboard
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className='w-8 h-8'>
                <AvatarFallback className='text-white bg-primary'>
                  {data?.claims.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className='w-56' align='end'>
              <DropdownMenuLabel className='font-normal'>
                <p className='text-xs leading-none text-muted-foreground'>{data?.claims?.email}</p>
              </DropdownMenuLabel>
              <SignOutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Link href='/login'>
          <Button variant='ghost' className='text-gray-700 hover:text-black'>
            Log In
          </Button>
        </Link>
      )}
    </>
  );
}
