import React from 'react'
import { Route, Routes } from 'react-router-dom'
import WebsiteLayout from '../layouts/WebsiteLayout'
import HomePage from '../features/home/pages/HomePage'
import AiLeadCapturePage from '../features/lead-capture/pages/AiLeadCapturePage'
import FoodMenuPage from '../features/menu/pages/FoodMenuPage'
import SoftDrinksPage from '../features/menu/pages/SoftDrinksPage'
import AlcoholicDrinksPage from '../features/menu/pages/AlcoholicDrinksPage'
import OffersPage from '../features/offers/pages/OffersPage'
import CateringEnquiryPage from '../features/catering/pages/CateringEnquiryPage'
import DeliveryEnquiryPage from '../features/delivery/pages/DeliveryEnquiryPage'
import FeedbackPage from '../features/feedback/pages/FeedbackPage'
import NotFound from '../pages/NotFound'
export default function AppRoutes() {
return (
<Routes>
<Route element={<WebsiteLayout />}>
<Route path="/" element={<HomePage />} />
<Route path="/ai-order-assistant" element={<AiLeadCapturePage />} />
<Route path="/menu/food" element={<FoodMenuPage />} />
<Route path="/menu/soft-drinks" element={<SoftDrinksPage />} />
<Route path="/menu/alcoholic-drinks" element={<AlcoholicDrinksPage />} />
<Route path="/offers" element={<OffersPage />} />
<Route path="/catering" element={<CateringEnquiryPage />} />
<Route path="/delivery" element={<DeliveryEnquiryPage />} />
<Route path="/feedback" element={<FeedbackPage />} />
</Route>
<Route path="*" element={<NotFound />} />
</Routes>
)
}
