
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Wheat, Lock, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLogin } from "@/hooks/uselogin";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Nome de usuário deve ter pelo menos 3 caracteres.",
  }),
  password: z.string().min(3, {
    message: "Senha deve ter pelo menos 6 caracteres.",
  }),
});

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { dadosAutenticacao, loading, error, autenticarLogin } = useLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const authData = await autenticarLogin(values.username, values.password);
      
      // Verifica se a autenticação foi bem-sucedida usando os dados retornados diretamente
      if (authData && authData.length > 0 && authData[0].status === true && authData[0].token) {
        // Salva o estado de autenticação
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userName", values.username);

        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao AgroFlow Sistemas!",
        });
        
        navigate("/grupo");
      } else {
        toast({
          title: "Erro no login",
          description: "Usuário ou senha inválidos.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erro no login",
        description: error || "Erro ao conectar com o servidor.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-6 md:py-8">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-3 md:mb-6">
          <div className="bg-industrial-primary p-2 md:p-4 rounded-full">
            <Wheat className="h-6 w-6 md:h-8 md:w-8 text-industrial-warning" />
          </div>
        </div>
        
        <h1 className="text-xl md:text-2xl font-bold text-center text-industrial-primary mb-2 md:mb-6">
          AgroFlow Sistemas
        </h1>
        <h2 className="text-sm md:text-xl text-center text-gray-600 mb-4 md:mb-8">
          Sistema de monitoramento
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">Nome de Usuário</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Digite seu nome de usuário"
                        className="pl-8 md:pl-10 h-10 md:h-11 text-sm md:text-base"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Digite sua senha"
                        className="pl-8 md:pl-10 h-10 md:h-11 text-sm md:text-base"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                className="w-full bg-industrial-primary hover:bg-industrial-primary/90 h-10 md:h-11 text-sm md:text-base"
                disabled={loading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? "Autenticando..." : "Entrar"}
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-500">
          <p className="hidden md:block">Sistema de monitoramento</p>
          <p>v1.1.3</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
