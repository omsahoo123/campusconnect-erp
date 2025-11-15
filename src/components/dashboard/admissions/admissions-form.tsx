
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { User, GraduationCap, Phone, Mail, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  dob: z.string().refine((dob) => new Date(dob).toString() !== 'Invalid Date', { message: 'Invalid date format. Use YYYY-MM-DD' }),
  gender: z.enum(["male", "female", "other"]),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  address: z.string().min(5, { message: "Address is too short." }),
  program: z.string({ required_error: "Please select a course." }),
  emergencyContactName: z.string().min(2, "Name is required."),
  emergencyContactPhone: z.string().min(10, "Phone number is required."),
}).refine(data => {
    const today = new Date();
    const birthDate = new Date(data.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 15;
}, {
    message: "Student must be at least 15 years old.",
    path: ["dob"],
});

export function AdmissionsForm() {
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      dob: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const existingAppsString = localStorage.getItem('studentApplications');
    const existingApps = existingAppsString ? JSON.parse(existingAppsString) : [];
    
    const newApp = {
      id: `APP${Date.now()}`,
      name: `${values.firstName} ${values.lastName}`,
      grade: 'N/A', // Grade is not in the form, setting a default
      gender: values.gender,
      date: new Date().toISOString(),
      status: 'Pending' as const,
      email: values.email,
      phone: values.phone,
    };

    const updatedApps = [...existingApps, newApp];
    localStorage.setItem('studentApplications', JSON.stringify(updatedApps));

    toast({
      title: "Admission Submitted!",
      description: `Application for ${values.firstName} ${values.lastName} has been received. Redirecting to login...`,
    })
    form.reset()
    setTimeout(() => router.push('/login'), 2000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><User /> Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Date of birth</FormLabel>
                             <FormControl>
                                <Input type="text" placeholder="YYYY-MM-DD" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><Phone /> Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input placeholder="john.doe@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="+1 234 567 890" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Full Address</FormLabel>
                            <FormControl>
                                <Input placeholder="123 University Ave, City, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl"><GraduationCap /> Academic Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="program"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Course</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a course to enroll in" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="B.Sc. Computer Science">B.Sc. Computer Science</SelectItem>
                                            <SelectItem value="B.Sc. Mathematics">B.Sc. Mathematics</SelectItem>
                                            <SelectItem value="B.Sc. Physics">B.Sc. Physics</SelectItem>
                                            <SelectItem value="B.A. History">B.A. History</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </CardContent>
                    </div>
                    <div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl"><Heart /> Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="emergencyContactName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Contact Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jane Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="emergencyContactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Contact Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 098 765 432" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </div>
                </div>
            </Card>

        </div>
        <div className="flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/90">Submit Application</Button>
        </div>
      </form>
    </Form>
  )
}
