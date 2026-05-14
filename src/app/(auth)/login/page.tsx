"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

import { login } from "./actions";
import { useActionState } from "react";

const initialState = {
  data: null,
  fieldErrors: null,
  error: null,
};

export default function Login() {
  //TODO redirect if the user is already logged in

  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className='mx-auto mt-16 w-full max-w-sm'>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='m@example.com'
                  required
                  defaultValue={state.data?.email ?? ""}
                />
                <FieldError errors={state.fieldErrors?.email?.map((m) => ({ message: m }))} />
              </Field>
              <Field>
                <FieldLabel htmlFor='password'>Password</FieldLabel>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  required
                  defaultValue={state.data?.password ?? ""}
                />
                <FieldError errors={state.fieldErrors?.password?.map((m) => ({ message: m }))} />
              </Field>
              <Field>
                <Button type='submit'>
                  {pending}
                  {pending ? "Signing you in..." : "Login"}
                </Button>
              </Field>
              {state.error && <FieldError>{state.error}</FieldError>}
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
