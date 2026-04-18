import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest, context: { params: Promise<{ orderId: string; }>; }) {
    try {
        await connectDb()
        const {orderId}=await context.params
        const {status}=await req.json()
        console.log(`[Delivery] Updating order ${orderId} to status: ${status}`)
        const order=await Order.findById(orderId).populate("user")
        if(!order){
            return NextResponse.json(
                {message:"order not found"},
                {status:400}
            )
        }
        order.status=status
        let deliveryBoysPayload:any=[]
        if(status==="out of delivery" && !order.assignment){
            console.log(`[Delivery] Finding nearby delivery boys for order ${orderId}`)
            const {latitude,longitude}=order.address
            console.log(`[Delivery] Order address: lat=${latitude}, lon=${longitude}`)
            // Search within 50km radius (50000 meters)
            const nearByDeliveryBoys=await User.find({
                role:"deliveryBoy",
                location:{
                    $near:{
                        $geometry:{type:"Point",coordinates:[Number(longitude),Number(latitude)]},
                        $maxDistance:50000
                    }
                }
            })
            console.log(`[Delivery] Found ${nearByDeliveryBoys.length} nearby delivery boys`)
            nearByDeliveryBoys.forEach(b => console.log(`[Delivery] - ${b.name}: socketId=${b.socketId}, location=${JSON.stringify(b.location?.coordinates)}`))
            const nearByIds=nearByDeliveryBoys.map((b)=>b._id)
            const busyIds=await DeliveryAssignment.find({
                assignedTo:{$in:nearByIds},
                status:{$nin:["brodcasted", "completed"]}
            }).distinct("assignedTo")
            const busyIdSet=new Set(busyIds.map(b=>String(b)))
            const availableDeliveryBoys=nearByDeliveryBoys.filter(
                b=>!busyIdSet.has(String(b._id))
            )
             const candidates=availableDeliveryBoys.map(b=>b._id)

             console.log(`[Delivery] Available candidates: ${candidates.length}`)
             if(candidates.length==0){
                console.log(`[Delivery] No available delivery boys!`)
                order.status = "pending"
                return NextResponse.json(
                    {message:"there is no available Delivery boys"},
                    {status:400}
                )
             }
   
             const deliveryAssignment=await DeliveryAssignment.create({
                order:order._id,
                brodcastedTo:candidates,
                status:"brodcasted"
             })

             await deliveryAssignment.populate("order");
             console.log(`[Delivery] Broadcasting assignment ${deliveryAssignment._id} to ${candidates.length} candidates`)
             for(const boyId of candidates){
                const boy=await User.findById(boyId)
                if(boy.socketId){
                    console.log(`[Delivery] Sending to ${boy.name} via socket ${boy.socketId}`)
                    await emitEventHandler("new-assignment",deliveryAssignment,boy.socketId)
                } else {
                    console.log(`[Delivery] ${boy.name} has no socketId, skipping emit`)
                }
             }

            
             order.assignment=deliveryAssignment._id
            deliveryBoysPayload=availableDeliveryBoys.map(b=>({
                id:b._id,
                name:b.name,
                mobile:b.mobile,
                latitude:b.location.coordinates[1],
                longitude:b.location.coordinates[0]
            }))
            await deliveryAssignment.populate("order")
            
        }

        await order.save()
        await order.populate("user")
      await emitEventHandler("order-status-update",{orderId:order._id,status:order.status})
        return NextResponse.json({
            assignment:order.assignment?._id,
            availableBoys:deliveryBoysPayload
        },{status:200})

    } catch (error) {
         return NextResponse.json({
           message:`update status error ${error}`
        },{status:500})
    }
}