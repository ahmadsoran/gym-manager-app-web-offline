import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from '@heroui/navbar'
import { Link } from '@heroui/link'
import { IconBarbell, IconPlus, IconHome, IconList } from '@tabler/icons-react'
import { ThemeSwitch } from './theme-switch'
import { siteConfig } from '@/config/site'

export default function Navbar() {
  return (
    <HeroNavbar
      maxWidth='xl'
      position='sticky'
      className='bg-background/70 backdrop-blur-md'>
      <NavbarContent className='basis-1/5 sm:basis-full' justify='start'>
        <NavbarBrand as='li' className='gap-3 max-w-fit'>
          <Link className='flex justify-start items-center gap-2' href='/'>
            <IconBarbell className='text-primary' size={32} />
            <p className='font-bold text-inherit text-xl'>Workout Manager</p>
          </Link>
        </NavbarBrand>
        <ul className='hidden sm:flex gap-4 justify-start ml-2'>
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className='flex items-center gap-2'
                color='foreground'
                href={item.href}>
                {item.href === '/' && <IconHome size={18} />}
                {item.href === '/workouts' && <IconList size={18} />}
                {item.href === '/workouts?action=add' && <IconPlus size={18} />}
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className='hidden sm:flex basis-1/5 sm:basis-full'
        justify='end'>
        <NavbarItem className='hidden sm:flex gap-2'>
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className='sm:hidden basis-1 pl-4' justify='end'>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className='mx-4 mt-2 flex flex-col gap-2'>
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className='flex items-center gap-2'
                color='foreground'
                href={item.href}
                size='lg'>
                {item.href === '/' && <IconHome size={20} />}
                {item.href === '/workouts' && <IconList size={20} />}
                {item.href === '/workouts?action=add' && <IconPlus size={20} />}
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroNavbar>
  )
}
