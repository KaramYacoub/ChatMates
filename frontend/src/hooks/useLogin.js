import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { login } from "../lib/api";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast.success("Login successful");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  return { loginMutation, isPending };
};
