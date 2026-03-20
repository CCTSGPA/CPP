import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import MainLayout from "../layouts/MainLayout";
import { uploadFile, submitComplaint } from "../services/complaintsService";
import { getHighAccuracyPosition, reverseGeocodeDebounced, isLocationInMaharashtra } from "../services/locationService";

// Categories for corruption complaints
const COMPLAINT_CATEGORIES = [
  "Bribery",
  "Fraud",
  "Abuse of Power",
  "Embezzlement",
  "Nepotism / Favoritism",
  "Extortion",
  "Other",
];

const schema = z.object({
  title: z.string().min(5, "Please enter a short title"),
  category: z.string().min(1, "Please select a category"),
  department: z.string().optional(),
  accusedName: z.string().optional(),
  accusedDesignation: z.string().optional(),
  description: z.string().min(20, "Provide details (at least 20 characters)"),
  location: z.string().optional(),
  complainantName: z.string().optional(),
  complainantEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  complainantPhone: z.string().optional(),
});

export default function FileComplaint() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    // eslint-disable-next-line no-unused-vars
    watch,
    trigger,
  } = useForm({ resolver: zodResolver(schema) });

  const [currentStep, setCurrentStep] = useState(1);
  const [isWhistleblowerMode, setIsWhistleblowerMode] = useState(false);
  const [cameraImage, setCameraImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [locationStatus, setLocationStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [isCapturingImage, setIsCapturingImage] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Get user's geolocation with high accuracy + reverse geocode
  const getLocation = async () => {
    setIsGettingLocation(true);
    setLocationStatus({ type: "", message: "" });
    setLocationAccuracy(null);

    try {
      // Use high accuracy position with progress tracking
      const position = await getHighAccuracyPosition({
        targetAccuracy: 20, // Target 20 meters accuracy for best results
        timeout: 30000,     // Wait up to 30 seconds
        onProgress: (accuracy) => {
          setLocationAccuracy(Math.round(accuracy));
          setLocationStatus({
            type: "loading",
            message: `Improving accuracy: ${Math.round(accuracy)}m (targeting ≤20m)...`,
          });
        },
      });

      const { latitude, longitude, accuracy } = position.coords;
      setLocationAccuracy(Math.round(accuracy));

      const geocodeResponse = await reverseGeocodeDebounced(latitude, longitude);
      const geo = geocodeResponse?.data || {};

      const computedAddress =
        geo.displayAddress ||
        [geo.area, geo.city, geo.state, geo.pincode].filter(Boolean).join(", ") ||
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      const locationData = {
        latitude,
        longitude,
        accuracy: Math.round(accuracy),
        city: geo.city || "",
        area: geo.area || "",
        state: geo.state || "",
        pincode: geo.pincode || "",
        displayAddress: computedAddress,
      };

      // Validate location is in India
      const validation = isLocationInMaharashtra(locationData);
      if (!validation.isValid) {
        setLocationStatus({
          type: "error",
          message: validation.message,
        });
        setIsGettingLocation(false);
        return;
      }

      setLocationDetails(locationData);
      setValue("location", computedAddress, { shouldValidate: true });
      
      const accuracyMsg = accuracy <= 20 
        ? `High accuracy (±${Math.round(accuracy)}m)` 
        : accuracy <= 50 
          ? `Good accuracy (±${Math.round(accuracy)}m)` 
          : `Moderate accuracy (±${Math.round(accuracy)}m)`;
      
      setLocationStatus({ 
        type: "success", 
        message: `Location detected. ${accuracyMsg}` 
      });
    } catch (error) {
      if (error.message === "Previous location request superseded by a newer request.") {
        return;
      }
      setLocationStatus({
        type: "error",
        message: error?.response?.data?.message || error.message || "Unable to retrieve location.",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      setIsCapturingImage(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prefer back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please check permissions.");
      setIsCapturingImage(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturingImage(false);
  };

  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCameraImage(imageDataUrl);
    setImagePreview(imageDataUrl);
    stopCamera();
  };

  // Handle file input change
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setCameraImage(file); // Store the actual file object for upload
    }
  };

  // Upload evidence and get URL
  const uploadEvidence = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadFile(file);
      return response.data.url; // Return the URL of the uploaded file
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    // Validate location is in India before submission
    if (!locationDetails) {
      alert("Please capture your location before submitting the complaint.");
      return;
    }

    const locationValidation = isLocationInMaharashtra(locationDetails);
    if (!locationValidation.isValid) {
      alert(locationValidation.message);
      return;
    }

    setIsLoading(true);
    try {
      let evidenceUrl = null;

      const incidentDate = new Date().toISOString().slice(0, 19);

      // Upload image if captured/selected
      if (cameraImage && cameraImage instanceof File) {
        evidenceUrl = await uploadEvidence(cameraImage);
      }

      // Prepare complaint data
      const complaintData = {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location || locationDetails?.displayAddress || "",
        latitude: locationDetails?.latitude,
        longitude: locationDetails?.longitude,
        accuracy: locationDetails?.accuracy,
        incidentDate,
        evidenceUrl: evidenceUrl,
        respondentName: data.accusedName || "",
        respondentDesignation: data.accusedDesignation || "",
        respondentDepartment: data.department || "",
        isAnonymous: isWhistleblowerMode,
        complainantName: isWhistleblowerMode ? "" : data.complainantName || "",
        complainantEmail: isWhistleblowerMode ? "" : data.complainantEmail || "",
        complainantPhone: isWhistleblowerMode ? "" : data.complainantPhone || "",
      };

      const response = await submitComplaint(complaintData);
      
      if (response.status === "success") {
        alert(
          `Complaint submitted successfully!\nTracking Number: ${response.data.trackingNumber}`
        );
        reset();
        setCameraImage(null);
        setImagePreview(null);
        setLocationDetails(null);
        setLocationStatus({ type: "", message: "" });
      } else {
        alert("Failed to submit complaint: " + response.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An error occurred while submitting the complaint. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Step navigation
  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ["category"];
    } else if (currentStep === 2) {
      if (!isWhistleblowerMode) {
        fieldsToValidate = ["complainantEmail"];
      }
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Reset form completely
  const resetForm = () => {
    reset();
    setCameraImage(null);
    setImagePreview(null);
    setLocationDetails(null);
    setLocationStatus({ type: "", message: "" });
    setCurrentStep(1);
    setIsWhistleblowerMode(false);
    stopCamera();
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="header-title">File a Complaint</h1>
        <p className="subtle mt-1">
          Use this form to submit allegations. Provide accurate details to help
          the investigation. You can capture photos and location automatically.
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mt-6 mb-8">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  currentStep >= step
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    currentStep > step ? "bg-purple-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Category & Accused Information */}
          {currentStep === 1 && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">Complaint Category & Accused Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    {...register("category")}
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {COMPLAINT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Department / Organization</label>
                  <input
                    {...register("department")}
                    placeholder="e.g. Municipal Corporation"
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Accused Name</label>
                  <input
                    {...register("accusedName")}
                    placeholder="Name of accused (if known)"
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Accused Designation</label>
                  <input
                    {...register("accusedDesignation")}
                    placeholder="e.g. Inspector, Manager"
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Your Information / Whistleblower Mode */}
          {currentStep === 2 && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">Your Information</h3>
              
              {/* Whistleblower Protection Toggle */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={isWhistleblowerMode}
                      onChange={(e) => setIsWhistleblowerMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                  <div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-gray-800">Whistleblower Protection Mode</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Your identity will never be stored or shown. A secure anonymous tracking token will be generated.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information (hidden in whistleblower mode) */}
              {!isWhistleblowerMode && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <input
                      {...register("complainantName")}
                      placeholder="Your full name"
                      className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <input
                      {...register("complainantEmail")}
                      type="email"
                      placeholder="your@email.com"
                      className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {errors.complainantEmail && (
                      <p className="text-sm text-red-600 mt-1">{errors.complainantEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <input
                      {...register("complainantPhone")}
                      type="tel"
                      placeholder="+1 234 567 8900"
                      className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {isWhistleblowerMode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Anonymous mode enabled</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your complaint will be submitted anonymously. You'll receive a secure tracking token to check your complaint status.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Complaint Details, Location & Evidence */}
          {currentStep === 3 && (
            <>
              <div className="card">
                <h3 className="font-semibold text-lg mb-4">Complaint Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <input
                      {...register("title")}
                      placeholder="Short summary (e.g., Bribe at local office)"
                      className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description *</label>
                    <textarea
                      {...register("description")}
                      rows={6}
                      placeholder="Describe what happened, when, who was involved"
                      className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-lg mb-4">Location & Evidence</h3>
                <div className="space-y-4">
                  {/* Location Section */}
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={locationDetails?.displayAddress || ""}
                        readOnly
                        placeholder="Click 'Detect My Location' to auto-fill location"
                        className="mt-1 flex-1 border border-gray-300 px-3 py-2 rounded-lg bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={getLocation}
                        disabled={isGettingLocation}
                        className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors min-w-[160px]"
                      >
                        {isGettingLocation 
                          ? locationAccuracy 
                            ? `Accuracy: ${locationAccuracy}m...` 
                            : "Detecting..." 
                          : "Detect My Location"}
                      </button>
                    </div>
                    {locationDetails && (
                      <p className="text-xs text-gray-500 mt-1">
                        Coordinates: {locationDetails.latitude.toFixed(6)}, {locationDetails.longitude.toFixed(6)} | Accuracy: ±{locationDetails.accuracy}m
                        {locationDetails.accuracy <= 20 && <span className="ml-2 text-green-600 font-medium">✓ High accuracy</span>}
                        {locationDetails.accuracy > 20 && locationDetails.accuracy <= 50 && <span className="ml-2 text-blue-600 font-medium">✓ Good accuracy</span>}
                        {locationDetails.accuracy > 50 && <span className="ml-2 text-amber-600 font-medium">⚠ Moderate accuracy</span>}
                      </p>
                    )}
                    {locationStatus.message && (
                      <p className={`text-sm mt-1 ${
                        locationStatus.type === "error" ? "text-red-600" : 
                        locationStatus.type === "loading" ? "text-blue-600 animate-pulse" : 
                        "text-green-700"
                      }`}>
                        {locationStatus.message}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        value={locationDetails?.city || ""}
                        readOnly
                        placeholder="City"
                        className="border border-gray-300 px-3 py-2 rounded-lg bg-gray-50"
                      />
                      <input
                        type="text"
                        value={locationDetails?.area || ""}
                        readOnly
                        placeholder="Area / Suburb"
                        className="border border-gray-300 px-3 py-2 rounded-lg bg-gray-50"
                      />
                      <input
                        type="text"
                        value={locationDetails?.state || ""}
                        readOnly
                        placeholder="State"
                        className="border border-gray-300 px-3 py-2 rounded-lg bg-gray-50"
                      />
                      <input
                        type="text"
                        value={locationDetails?.pincode || ""}
                        readOnly
                        placeholder="Pincode"
                        className="border border-gray-300 px-3 py-2 rounded-lg bg-gray-50"
                      />
                    </div>

                    <input
                      type="hidden"
                      {...register("location")}
                    />
                  </div>

                  {/* Camera Section */}
                  <div>
                    <label className="text-sm font-medium">Evidence Photo</label>
                    <div className="mt-1 space-y-2">
                      {!isCapturingImage ? (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Capture Photo
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full border rounded-lg"
                              style={{ maxHeight: "300px" }}
                            />
                            <canvas ref={canvasRef} className="hidden" />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={captureImage}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Capture
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Image Preview */}
                      {imagePreview && !isCapturingImage && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Captured/Selected Image:</p>
                          <img
                            src={imagePreview}
                            alt="Evidence preview"
                            className="mt-1 max-w-xs max-h-48 object-contain border rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCameraImage(null);
                              setImagePreview(null);
                            }}
                            className="mt-1 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}

                      {/* File input as alternative */}
                      <div className="mt-2">
                        <label className="text-sm text-gray-600">Or upload existing image:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Submitting..." : "Submit Complaint"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
