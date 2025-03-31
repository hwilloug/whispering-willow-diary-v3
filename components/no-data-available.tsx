import { Plus } from "lucide-react";
import { Button } from "./ui/button";


const NoDataAvailable = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-primary-dark/70">No data available</p>
      <Button className="mt-4 bg-secondary hover:bg-secondary-light text-white"><Plus className="h-4 w-4" /> Create an entry</Button>
    </div>
  )
}

export default NoDataAvailable;